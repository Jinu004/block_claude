# main.py - FastAPI Arduino/MicroPython Compiler Backend
import os
import shutil
import tempfile
import subprocess
import asyncio
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import uuid
import json

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, validator
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Blockly IDE Compiler Service",
    description="Backend service for compiling Arduino/MicroPython code from Blockly IDE",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class CompileRequest(BaseModel):
    code: str
    board: str = "arduino:avr:uno"
    language: str = "arduino"  # "arduino" or "micropython"
    
    @validator('code')
    def code_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Code cannot be empty')
        return v
    
    @validator('board')
    def board_must_be_valid(cls, v):
        valid_boards = [
            "arduino:avr:uno",
            "arduino:avr:nano", 
            "arduino:avr:mega",
            "esp32:esp32:esp32",
            "esp8266:esp8266:nodemcuv2"
        ]
        if v not in valid_boards:
            logger.warning(f"Board {v} not in predefined list, but allowing it")
        return v

class BoardInfo(BaseModel):
    fqbn: str
    name: str
    description: str

# Configuration
class Config:
    TEMP_DIR = Path("./temp")
    ARDUINO_CLI_PATH = "arduino-cli"
    MAX_COMPILE_TIME = 120  # seconds
    SUPPORTED_BOARDS = {
        "arduino:avr:uno": {
            "name": "Arduino Uno",
            "description": "Arduino Uno R3",
            "file_extension": ".hex"
        },
        "arduino:avr:nano": {
            "name": "Arduino Nano",
            "description": "Arduino Nano",
            "file_extension": ".hex"
        },
        "arduino:avr:mega": {
            "name": "Arduino Mega",
            "description": "Arduino Mega 2560",
            "file_extension": ".hex"
        },
        "esp32:esp32:esp32": {
            "name": "ESP32 Dev Module",
            "description": "ESP32 Development Board",
            "file_extension": ".bin"
        },
        "esp8266:esp8266:nodemcuv2": {
            "name": "NodeMCU ESP8266",
            "description": "NodeMCU v2 ESP8266",
            "file_extension": ".bin"
        }
    }

config = Config()

# Utility functions
def ensure_temp_dir():
    """Ensure temp directory exists"""
    config.TEMP_DIR.mkdir(exist_ok=True)

def generate_sketch_name() -> str:
    """Generate unique sketch name"""
    return f"sketch_{uuid.uuid4().hex[:8]}"

def cleanup_temp_folder(folder_path: Path):
    """Clean up temporary folder"""
    try:
        if folder_path.exists():
            shutil.rmtree(folder_path)
            logger.info(f"Cleaned up temp folder: {folder_path}")
    except Exception as e:
        logger.error(f"Failed to cleanup {folder_path}: {e}")

async def check_arduino_cli():
    """Check if arduino-cli is available"""
    try:
        result = await asyncio.create_subprocess_exec(
            config.ARDUINO_CLI_PATH, "version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await result.communicate()
        if result.returncode == 0:
            return True, stdout.decode()
        else:
            return False, stderr.decode()
    except FileNotFoundError:
        return False, "arduino-cli not found in PATH"

def get_output_file_path(sketch_folder: Path, board: str) -> Optional[Path]:
    """Find the compiled output file"""
    board_info = config.SUPPORTED_BOARDS.get(board, {})
    file_extension = board_info.get("file_extension", ".hex")
    
    # Common output locations
    possible_paths = [
        sketch_folder / "build" / board.replace(":", ".") / f"{sketch_folder.name}.ino{file_extension}",
        sketch_folder / "build" / f"{sketch_folder.name}.ino{file_extension}",
        sketch_folder / f"{sketch_folder.name}.ino{file_extension}",
    ]
    
    for path in possible_paths:
        if path.exists():
            return path
    
    # Search for any .hex or .bin files in build directory
    build_dir = sketch_folder / "build"
    if build_dir.exists():
        for file_ext in [".hex", ".bin"]:
            for file_path in build_dir.rglob(f"*{file_ext}"):
                return file_path
    
    return None

async def compile_arduino_code(code: str, board: str, sketch_folder: Path) -> tuple[bool, str, Optional[Path]]:
    """Compile Arduino code using arduino-cli"""
    sketch_name = sketch_folder.name
    sketch_file = sketch_folder / f"{sketch_name}.ino"
    
    # Write code to .ino file
    try:
        sketch_file.write_text(code, encoding='utf-8')
        logger.info(f"Created sketch file: {sketch_file}")
    except Exception as e:
        return False, f"Failed to write sketch file: {e}", None
    
    # Compile using arduino-cli
    compile_cmd = [
        config.ARDUINO_CLI_PATH,
        "compile",
        "--fqbn", board,
        "--output-dir", str(sketch_folder / "build"),
        str(sketch_folder)
    ]
    
    try:
        logger.info(f"Running compile command: {' '.join(compile_cmd)}")
        
        process = await asyncio.create_subprocess_exec(
            *compile_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(sketch_folder.parent)
        )
        
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), 
                timeout=config.MAX_COMPILE_TIME
            )
        except asyncio.TimeoutError:
            process.kill()
            return False, "Compilation timed out", None
        
        stdout_str = stdout.decode('utf-8')
        stderr_str = stderr.decode('utf-8')
        
        logger.info(f"Compile stdout: {stdout_str}")
        if stderr_str:
            logger.warning(f"Compile stderr: {stderr_str}")
        
        if process.returncode == 0:
            # Find output file
            output_file = get_output_file_path(sketch_folder, board)
            if output_file and output_file.exists():
                return True, stdout_str, output_file
            else:
                return False, f"Compilation successful but output file not found. Searched in: {sketch_folder}", None
        else:
            error_msg = stderr_str if stderr_str else stdout_str
            return False, f"Compilation failed: {error_msg}", None
            
    except Exception as e:
        logger.error(f"Compilation error: {e}")
        return False, f"Compilation error: {e}", None

# API Routes

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Blockly IDE Compiler",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    cli_available, cli_info = await check_arduino_cli()
    
    return {
        "status": "healthy" if cli_available else "degraded",
        "arduino_cli": {
            "available": cli_available,
            "info": cli_info
        },
        "temp_dir": str(config.TEMP_DIR),
        "supported_boards": list(config.SUPPORTED_BOARDS.keys())
    }

@app.get("/boards")
async def get_supported_boards():
    """Get list of supported boards"""
    boards = []
    for fqbn, info in config.SUPPORTED_BOARDS.items():
        boards.append({
            "fqbn": fqbn,
            "name": info["name"],
            "description": info["description"]
        })
    return {"boards": boards}

@app.post("/compile")
async def compile_code(request: CompileRequest):
    """
    Compile Arduino/MicroPython code
    
    Returns:
    - On success: Binary file stream (.hex/.bin)
    - On error: JSON with error message
    """
    ensure_temp_dir()
    
    # Check if arduino-cli is available
    cli_available, cli_info = await check_arduino_cli()
    if not cli_available:
        raise HTTPException(
            status_code=500, 
            detail=f"Arduino CLI not available: {cli_info}"
        )
    
    # Generate unique sketch folder
    sketch_name = generate_sketch_name()
    sketch_folder = config.TEMP_DIR / sketch_name
    
    try:
        # Create sketch folder
        sketch_folder.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created sketch folder: {sketch_folder}")
        
        if request.language.lower() == "arduino":
            # Compile Arduino code
            success, message, output_file = await compile_arduino_code(
                request.code, request.board, sketch_folder
            )
            
            if success and output_file:
                # Read the compiled file
                try:
                    file_content = output_file.read_bytes()
                    file_extension = output_file.suffix
                    
                    # Determine filename
                    board_info = config.SUPPORTED_BOARDS.get(request.board, {})
                    filename = f"firmware{file_extension}"
                    
                    logger.info(f"Serving compiled file: {output_file} ({len(file_content)} bytes)")
                    
                    # Return file as download
                    return Response(
                        content=file_content,
                        media_type="application/octet-stream",
                        headers={
                            "Content-Disposition": f"attachment; filename={filename}",
                            "Content-Length": str(len(file_content))
                        }
                    )
                    
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to read compiled file: {e}"
                    )
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Compilation failed: {message}"
                )
                
        elif request.language.lower() == "micropython":
            # MicroPython support placeholder
            raise HTTPException(
                status_code=501,
                detail="MicroPython compilation not yet implemented"
            )
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: {request.language}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during compilation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {e}"
        )
    
    finally:
        # Cleanup temp folder
        cleanup_temp_folder(sketch_folder)

@app.post("/validate")
async def validate_code(request: CompileRequest):
    """
    Validate code without compiling (syntax check)
    """
    if request.language.lower() == "arduino":
        # Basic Arduino code validation
        required_functions = ["setup", "loop"]
        missing_functions = []
        
        for func in required_functions:
            if f"void {func}()" not in request.code and f"{func}()" not in request.code:
                missing_functions.append(func)
        
        if missing_functions:
            return {
                "valid": False,
                "errors": [f"Missing required function: {func}" for func in missing_functions],
                "warnings": []
            }
        
        return {
            "valid": True,
            "errors": [],
            "warnings": []
        }
    
    elif request.language.lower() == "micropython":
        return {
            "valid": True,
            "errors": [],
            "warnings": ["MicroPython validation not implemented"]
        }
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {request.language}"
        )

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )