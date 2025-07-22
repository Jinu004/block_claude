/**
 * Code generators for custom hardware blocks
 * Supports JavaScript, Python, and Arduino C++ generation
 */

// ===== JavaScript Generators =====

// LED ON
javascript.javascriptGenerator.forBlock['hardware_led_on'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `digitalWrite(${pin}, HIGH); // Turn LED ON\n`;
    return code;
};

// LED OFF
javascript.javascriptGenerator.forBlock['hardware_led_off'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `digitalWrite(${pin}, LOW); // Turn LED OFF\n`;
    return code;
};

// LED Blink
javascript.javascriptGenerator.forBlock['hardware_led_blink'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const delay = block.getFieldValue('DELAY');
    const code = `// Blink LED on pin ${pin}
digitalWrite(${pin}, HIGH);
delay(${delay});
digitalWrite(${pin}, LOW);
delay(${delay});
`;
    return code;
};

// Delay
javascript.javascriptGenerator.forBlock['hardware_delay'] = function(block, generator) {
    const time = block.getFieldValue('TIME');
    const code = `delay(${time}); // Wait ${time}ms\n`;
    return code;
};

// Digital Read
javascript.javascriptGenerator.forBlock['hardware_digital_read'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `digitalRead(${pin})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// Digital Write
javascript.javascriptGenerator.forBlock['hardware_digital_write'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    const code = `digitalWrite(${pin}, ${state}); // Set pin ${pin} to ${state}\n`;
    return code;
};

// Program Start
javascript.javascriptGenerator.forBlock['program_start'] = function(block, generator) {
    const code = `// Program Started\nconsole.log("🚀 Program Started!");\n`;
    return code;
};

// Arduino Setup
javascript.javascriptGenerator.forBlock['arduino_setup'] = function(block, generator) {
    const setupCode = generator.statementToCode(block, 'SETUP_CODE');
    const code = `// Setup - runs once\nfunction setup() {\n${setupCode}}\n\n`;
    return code;
};

// Arduino Loop
javascript.javascriptGenerator.forBlock['arduino_loop'] = function(block, generator) {
    const loopCode = generator.statementToCode(block, 'LOOP_CODE');
    const code = `// Loop - runs forever\nfunction loop() {\n${loopCode}}\n\n`;
    return code;
};

// Analog Read
javascript.javascriptGenerator.forBlock['hardware_analog_read'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `analogRead(${pin})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// Serial Print
javascript.javascriptGenerator.forBlock['hardware_serial_print'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', javascript.Order.ATOMIC) || '""';
    const code = `console.log(${text}); // Serial print\n`;
    return code;
};

// Serial Print Line
javascript.javascriptGenerator.forBlock['hardware_serial_println'] = function(block, generator) {
    const text = generator.valueToCode(block, 'TEXT', javascript.Order.ATOMIC) || '""';
    const code = `console.log(${text}); // Serial println\n`;
    return code;
};

// Analog Write (PWM)
javascript.javascriptGenerator.forBlock['hardware_analog_write'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const value = generator.valueToCode(block, 'VALUE', javascript.Order.ATOMIC) || '0';
    const code = `analogWrite(${pin}, ${value}); // PWM output\n`;
    return code;
};

// Servo
javascript.javascriptGenerator.forBlock['hardware_servo'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const angle = generator.valueToCode(block, 'ANGLE', javascript.Order.ATOMIC) || '0';
    const code = `servo.write(${angle}); // Move servo to ${angle} degrees\n`;
    return code;
};

// Temperature
javascript.javascriptGenerator.forBlock['hardware_temperature'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `getTemperature(${pin})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// ===== Arduino C++ Code Generation =====
const ArduinoGenerator = {
    // LED ON
    'hardware_led_on': function(block) {
        const pin = block.getFieldValue('PIN');
        return `digitalWrite(${pin}, HIGH); // Turn LED ON\n`;
    },

    // LED OFF
    'hardware_led_off': function(block) {
        const pin = block.getFieldValue('PIN');
        return `digitalWrite(${pin}, LOW); // Turn LED OFF\n`;
    },

    // LED Blink
    'hardware_led_blink': function(block) {
        const pin = block.getFieldValue('PIN');
        const delay = block.getFieldValue('DELAY');
        return `// Blink LED on pin ${pin}
digitalWrite(${pin}, HIGH);
delay(${delay});
digitalWrite(${pin}, LOW);
delay(${delay});
`;
    },

    // Delay
    'hardware_delay': function(block) {
        const time = block.getFieldValue('TIME');
        return `delay(${time}); // Wait ${time}ms\n`;
    },

    // Digital Read
    'hardware_digital_read': function(block) {
        const pin = block.getFieldValue('PIN');
        return [`digitalRead(${pin})`, 'ORDER_FUNCTION_CALL'];
    },

    // Digital Write
    'hardware_digital_write': function(block) {
        const pin = block.getFieldValue('PIN');
        const state = block.getFieldValue('STATE');
        return `digitalWrite(${pin}, ${state}); // Set pin ${pin} to ${state}\n`;
    },

    // Program Start
    'program_start': function(block) {
        return `// Program Started\nSerial.println("Program Started!");\n`;
    },

    // Arduino Setup
    'arduino_setup': function(block, generator) {
        const setupCode = this.statementToCode(block, 'SETUP_CODE', generator);
        return `void setup() {
  Serial.begin(9600);
  // Initialize pins
${setupCode}
}

`;
    },

    // Arduino Loop
    'arduino_loop': function(block, generator) {
        const loopCode = this.statementToCode(block, 'LOOP_CODE', generator);
        return `void loop() {
${loopCode}
}
`;
    },

    // Analog Read
    'hardware_analog_read': function(block) {
        const pin = block.getFieldValue('PIN');
        return [`analogRead(${pin})`, 'ORDER_FUNCTION_CALL'];
    },

    // Serial Print
    'hardware_serial_print': function(block, generator) {
        const text = this.valueToCode(block, 'TEXT', 'ORDER_ATOMIC', generator) || '""';
        return `Serial.print(${text});\n`;
    },

    // Serial Print Line
    'hardware_serial_println': function(block, generator) {
        const text = this.valueToCode(block, 'TEXT', 'ORDER_ATOMIC', generator) || '""';
        return `Serial.println(${text});\n`;
    },

    // Helper functions
    statementToCode: function(block, inputName, generator) {
        const targetBlock = block.getInputTargetBlock(inputName);
        if (targetBlock) {
            return this.blockToCode(targetBlock, generator);
        }
        return '';
    },

    valueToCode: function(block, inputName, order, generator) {
        const targetBlock = block.getInputTargetBlock(inputName);
        if (targetBlock) {
            const result = this.blockToCode(targetBlock, generator);
            return Array.isArray(result) ? result[0] : result;
        }
        return '';
    },

    blockToCode: function(block, generator) {
        if (!block) return '';
        
        const type = block.type;
        if (this[type]) {
            const result = this[type](block, generator);
            
            // Handle next block
            const nextBlock = block.getNextBlock();
            if (nextBlock) {
                const nextCode = this.blockToCode(nextBlock, generator);
                if (Array.isArray(result)) {
                    return result[0] + nextCode;
                } else {
                    return result + nextCode;
                }
            }
            
            return result;
        }
        
        // Fallback for standard Blockly blocks
        if (generator && generator.blockToCode) {
            return generator.blockToCode(block);
        }
        
        return '';
    }
};

// Temperature
javascript.javascriptGenerator.forBlock['hardware_temperature'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const code = `getTemperature(${pin})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// Ultrasonic
javascript.javascriptGenerator.forBlock['hardware_ultrasonic'] = function(block, generator) {
    const trigPin = block.getFieldValue('TRIG_PIN');
    const echoPin = block.getFieldValue('ECHO_PIN');
    const code = `getDistance(${trigPin}, ${echoPin})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// Buzzer
javascript.javascriptGenerator.forBlock['hardware_buzzer'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const frequency = generator.valueToCode(block, 'FREQUENCY', javascript.Order.ATOMIC) || '1000';
    const duration = generator.valueToCode(block, 'DURATION', javascript.Order.ATOMIC) || '500';
    const code = `playTone(${pin}, ${frequency}, ${duration}); // Play tone\n`;
    return code;
};

// WiFi Connect
javascript.javascriptGenerator.forBlock['hardware_wifi_connect'] = function(block, generator) {
    const ssid = generator.valueToCode(block, 'SSID', javascript.Order.ATOMIC) || '""';
    const password = generator.valueToCode(block, 'PASSWORD', javascript.Order.ATOMIC) || '""';
    const code = `connectWiFi(${ssid}, ${password}); // Connect to WiFi\n`;
    return code;
};

// HTTP GET
javascript.javascriptGenerator.forBlock['hardware_http_get'] = function(block, generator) {
    const url = generator.valueToCode(block, 'URL', javascript.Order.ATOMIC) || '""';
    const code = `httpGet(${url})`;
    return [code, javascript.Order.FUNCTION_CALL];
};

// Custom Function
javascript.javascriptGenerator.forBlock['hardware_custom_function'] = function(block, generator) {
    const functionName = block.getFieldValue('FUNCTION_NAME');
    const functionBody = generator.statementToCode(block, 'FUNCTION_BODY');
    const code = `function ${functionName}() {\n${functionBody}}\n`;
    return code;
};

// Comment
javascript.javascriptGenerator.forBlock['hardware_comment'] = function(block, generator) {
    const comment = block.getFieldValue('COMMENT');
    const code = `// ${comment}\n`;
    return code;
};

// ===== Additional Arduino C++ Generators =====

// Temperature
ArduinoGenerator['hardware_temperature'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`readTemperature(${pin})`, 'ORDER_FUNCTION_CALL'];
};

// Ultrasonic
ArduinoGenerator['hardware_ultrasonic'] = function(block) {
    const trigPin = block.getFieldValue('TRIG_PIN');
    const echoPin = block.getFieldValue('ECHO_PIN');
    return [`getUltrasonicDistance(${trigPin}, ${echoPin})`, 'ORDER_FUNCTION_CALL'];
};

// Buzzer
ArduinoGenerator['hardware_buzzer'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const frequency = this.valueToCode(block, 'FREQUENCY', 'ORDER_ATOMIC', generator) || '1000';
    const duration = this.valueToCode(block, 'DURATION', 'ORDER_ATOMIC', generator) || '500';
    return `tone(${pin}, ${frequency}, ${duration});\n`;
};

// WiFi Connect
ArduinoGenerator['hardware_wifi_connect'] = function(block, generator) {
    const ssid = this.valueToCode(block, 'SSID', 'ORDER_ATOMIC', generator) || '""';
    const password = this.valueToCode(block, 'PASSWORD', 'ORDER_ATOMIC', generator) || '""';
    return `WiFi.begin(${ssid}, ${password});\n`;
};

// HTTP GET
ArduinoGenerator['hardware_http_get'] = function(block, generator) {
    const url = this.valueToCode(block, 'URL', 'ORDER_ATOMIC', generator) || '""';
    return [`httpGET(${url})`, 'ORDER_FUNCTION_CALL'];
};

// Custom Function
ArduinoGenerator['hardware_custom_function'] = function(block, generator) {
    const functionName = block.getFieldValue('FUNCTION_NAME');
    const functionBody = this.statementToCode(block, 'FUNCTION_BODY', generator);
    return `void ${functionName}() {\n${functionBody}}\n\n`;
};

// Comment
ArduinoGenerator['hardware_comment'] = function(block) {
    const comment = block.getFieldValue('COMMENT');
    return `// ${comment}\n`;
};

// ===== Additional Python Generators =====

// Temperature
PythonGenerator['hardware_temperature'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`read_temperature(${pin})`, 'ORDER_FUNCTION_CALL'];
};

// Ultrasonic
PythonGenerator['hardware_ultrasonic'] = function(block) {
    const trigPin = block.getFieldValue('TRIG_PIN');
    const echoPin = block.getFieldValue('ECHO_PIN');
    return [`get_distance(${trigPin}, ${echoPin})`, 'ORDER_FUNCTION_CALL'];
};

// Buzzer
PythonGenerator['hardware_buzzer'] = function(block, generator) {
    const pin = block.getFieldValue('PIN');
    const frequency = this.valueToCode(block, 'FREQUENCY', 'ORDER_ATOMIC', generator) || '1000';
    const duration = this.valueToCode(block, 'DURATION', 'ORDER_ATOMIC', generator) || '500';
    return `play_tone(${pin}, ${frequency}, ${duration})  # Play tone\n`;
};

// WiFi Connect
PythonGenerator['hardware_wifi_connect'] = function(block, generator) {
    const ssid = this.valueToCode(block, 'SSID', 'ORDER_ATOMIC', generator) || '""';
    const password = this.valueToCode(block, 'PASSWORD', 'ORDER_ATOMIC', generator) || '""';
    return `connect_wifi(${ssid}, ${password})  # Connect to WiFi\n`;
};

// HTTP GET
PythonGenerator['hardware_http_get'] = function(block, generator) {
    const url = this.valueToCode(block, 'URL', 'ORDER_ATOMIC', generator) || '""';
    return [`http_get(${url})`, 'ORDER_FUNCTION_CALL'];
};

// Custom Function
PythonGenerator['hardware_custom_function'] = function(block, generator) {
    const functionName = block.getFieldValue('FUNCTION_NAME');
    const functionBody = this.statementToCode(block, 'FUNCTION_BODY', generator);
    return `def ${functionName}():\n${functionBody || '    pass'}\n\n`;
};

// Comment
PythonGenerator['hardware_comment'] = function(block) {
    const comment = block.getFieldValue('COMMENT');
    return `# ${comment}\n`;
};

// ===== Helper Functions for Python Generator =====
PythonGenerator.statementToCode = function(block, inputName, generator) {
    const targetBlock = block.getInputTargetBlock(inputName);
    if (targetBlock) {
        return this.blockToCode(targetBlock, generator);
    }
    return '';
};

PythonGenerator.valueToCode = function(block, inputName, order, generator) {
    const targetBlock = block.getInputTargetBlock(inputName);
    if (targetBlock) {
        const result = this.blockToCode(targetBlock, generator);
        return Array.isArray(result) ? result[0] : result;
    }
    return '';
};

PythonGenerator.blockToCode = function(block, generator) {
    if (!block) return '';
    
    const type = block.type;
    if (this[type]) {
        const result = this[type](block, generator);
        
        // Handle next block
        const nextBlock = block.getNextBlock();
        if (nextBlock) {
            const nextCode = this.blockToCode(nextBlock, generator);
            if (Array.isArray(result)) {
                return result[0] + nextCode;
            } else {
                return result + nextCode;
            }
        }
        
        return result;
    }
    
    return '';
};

Blockly.Arduino = {
  workspaceToCode: function(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    let code = '';

    for (const block of topBlocks) {
      code += ArduinoGenerator.blockToCode(block, ArduinoGenerator);
    }

    return code;
  }
};

Blockly.Python = {
  workspaceToCode: function(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    let code = '';

    for (const block of topBlocks) {
      code += PythonGenerator.blockToCode(block, PythonGenerator);
    }

    return code;
  }
};
