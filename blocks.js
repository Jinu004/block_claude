/**
 * Custom Blockly Blocks for Hardware Programming
 * Includes blocks for LED control, digital I/O, and timing
 */

// ===== Hardware LED ON Block =====
Blockly.Blocks['hardware_led_on'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Turn LED ON")
            .appendField("Pin")
            .appendField(new Blockly.FieldNumber(13, 0, 40, 1), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF6B35");
        this.setTooltip("Turn on an LED connected to the specified pin");
        this.setHelpUrl("");
    }
};

// ===== Hardware LED OFF Block =====
Blockly.Blocks['hardware_led_off'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Turn LED OFF")
            .appendField("Pin")
            .appendField(new Blockly.FieldNumber(13, 0, 40, 1), "PIN");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF6B35");
        this.setTooltip("Turn off an LED connected to the specified pin");
        this.setHelpUrl("");
    }
};

// ===== Hardware LED Blink Block =====
Blockly.Blocks['hardware_led_blink'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Blink LED")
            .appendField("Pin")
            .appendField(new Blockly.FieldNumber(13, 0, 40, 1), "PIN")
            .appendField("Delay")
            .appendField(new Blockly.FieldNumber(1000, 100, 10000, 100), "DELAY")
            .appendField("ms");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF6B35");
        this.setTooltip("Blink an LED with the specified delay");
        this.setHelpUrl("");
    }
};

// ===== Hardware Delay Block =====
Blockly.Blocks['hardware_delay'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Wait")
            .appendField(new Blockly.FieldNumber(1000, 1, 60000, 1), "TIME")
            .appendField("milliseconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FFA500");
        this.setTooltip("Wait for the specified number of milliseconds");
        this.setHelpUrl("");
    }
};

// ===== Hardware Digital Read Block =====
Blockly.Blocks['hardware_digital_read'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Read digital pin")
            .appendField(new Blockly.FieldNumber(2, 0, 40, 1), "PIN");
        this.setOutput(true, "Boolean");
        this.setColour("#4CAF50");
        this.setTooltip("Read the digital value from a pin (HIGH or LOW)");
        this.setHelpUrl("");
    }
};

// ===== Hardware Digital Write Block =====
Blockly.Blocks['hardware_digital_write'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Set digital pin")
            .appendField(new Blockly.FieldNumber(13, 0, 40, 1), "PIN")
            .appendField("to")
            .appendField(new Blockly.FieldDropdown([
                ["HIGH", "HIGH"],
                ["LOW", "LOW"]
            ]), "STATE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4CAF50");
        this.setTooltip("Set a digital pin to HIGH or LOW");
        this.setHelpUrl("");
    }
};

// ===== Program Start Block =====
Blockly.Blocks['program_start'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🚀 Program Start");
        this.setNextStatement(true, null);
        this.setColour("#9C27B0");
        this.setTooltip("Starting point for your program");
        this.setHelpUrl("");
        this.setDeletable(false); // Make it non-deletable
    }
};

// ===== Setup and Loop Blocks for Arduino-style programming =====
Blockly.Blocks['arduino_setup'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("⚙️ Setup (run once)");
        this.appendStatementInput("SETUP_CODE")
            .setCheck(null);
        this.setNextStatement(true, null);
        this.setColour("#673AB7");
        this.setTooltip("Code that runs once when the program starts");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['arduino_loop'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("🔄 Loop (run forever)");
        this.appendStatementInput("LOOP_CODE")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setColour("#2196F3");
        this.setTooltip("Code that runs repeatedly in a loop");
        this.setHelpUrl("");
    }
};

// ===== Sensor Blocks =====
Blockly.Blocks['hardware_analog_read'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Read analog pin")
            .appendField(new Blockly.FieldDropdown([
                ["A0", "A0"],
                ["A1", "A1"],
                ["A2", "A2"],
                ["A3", "A3"],
                ["A4", "A4"],
                ["A5", "A5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setColour("#FF9800");
        this.setTooltip("Read analog value from pin (0-1023)");
        this.setHelpUrl("");
    }
};

// ===== Serial Communication Blocks =====
Blockly.Blocks['hardware_serial_print'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("Print to serial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#607D8B");
        this.setTooltip("Print text to serial monitor");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['hardware_serial_println'] = {
    init: function() {
        this.appendValueInput("TEXT")
            .setCheck(null)
            .appendField("Print line to serial");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#607D8B");
        this.setTooltip("Print text to serial monitor with new line");
        this.setHelpUrl("");
    }
};

// ===== PWM Block =====
Blockly.Blocks['hardware_analog_write'] = {
    init: function() {
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("Set PWM pin")
            .appendField(new Blockly.FieldNumber(9, 0, 40, 1), "PIN")
            .appendField("to value");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Set PWM value on pin (0-255)");
        this.setHelpUrl("");
    }
};

// ===== Servo Motor Block =====
Blockly.Blocks['hardware_servo'] = {
    init: function() {
        this.appendValueInput("ANGLE")
            .setCheck("Number")
            .appendField("Move servo on pin")
            .appendField(new Blockly.FieldNumber(9, 0, 40, 1), "PIN")
            .appendField("to angle");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#795548");
        this.setTooltip("Move servo to specified angle (0-180 degrees)");
        this.setHelpUrl("");
    }
};

// ===== Temperature Sensor Block =====
Blockly.Blocks['hardware_temperature'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Read temperature from pin")
            .appendField(new Blockly.FieldDropdown([
                ["A0", "A0"],
                ["A1", "A1"],
                ["A2", "A2"],
                ["A3", "A3"],
                ["A4", "A4"],
                ["A5", "A5"]
            ]), "PIN");
        this.setOutput(true, "Number");
        this.setColour("#4CAF50");
        this.setTooltip("Read temperature in Celsius from analog sensor");
        this.setHelpUrl("");
    }
};

// ===== Ultrasonic Sensor Block =====
Blockly.Blocks['hardware_ultrasonic'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Ultrasonic distance")
            .appendField("Trig Pin")
            .appendField(new Blockly.FieldNumber(7, 0, 40, 1), "TRIG_PIN")
            .appendField("Echo Pin")
            .appendField(new Blockly.FieldNumber(8, 0, 40, 1), "ECHO_PIN");
        this.setOutput(true, "Number");
        this.setColour("#9C27B0");
        this.setTooltip("Measure distance using ultrasonic sensor (returns cm)");
        this.setHelpUrl("");
    }
};

// ===== Buzzer Block =====
Blockly.Blocks['hardware_buzzer'] = {
    init: function() {
        this.appendValueInput("FREQUENCY")
            .setCheck("Number")
            .appendField("Play tone on pin")
            .appendField(new Blockly.FieldNumber(9, 0, 40, 1), "PIN")
            .appendField("frequency");
        this.appendValueInput("DURATION")
            .setCheck("Number")
            .appendField("duration");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF5722");
        this.setTooltip("Play a tone with specified frequency and duration");
        this.setHelpUrl("");
    }
};

// ===== WiFi Connect Block =====
Blockly.Blocks['hardware_wifi_connect'] = {
    init: function() {
        this.appendValueInput("SSID")
            .setCheck("String")
            .appendField("Connect to WiFi SSID");
        this.appendValueInput("PASSWORD")
            .setCheck("String")
            .appendField("Password");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#2196F3");
        this.setTooltip("Connect to WiFi network");
        this.setHelpUrl("");
    }
};

// ===== HTTP Request Block =====
Blockly.Blocks['hardware_http_get'] = {
    init: function() {
        this.appendValueInput("URL")
            .setCheck("String")
            .appendField("HTTP GET request to");
        this.setOutput(true, "String");
        this.setColour("#00BCD4");
        this.setTooltip("Make HTTP GET request and return response");
        this.setHelpUrl("");
    }
};

// ===== Custom Function Block =====
Blockly.Blocks['hardware_custom_function'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Custom Function")
            .appendField(new Blockly.FieldTextInput("myFunction"), "FUNCTION_NAME");
        this.appendStatementInput("FUNCTION_BODY")
            .setCheck(null)
            .appendField("do");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#795548");
        this.setTooltip("Create a custom function");
        this.setHelpUrl("");
    }
};

// ===== Comment Block =====
Blockly.Blocks['hardware_comment'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Comment:")
            .appendField(new Blockly.FieldTextInput("Add your comment here"), "COMMENT");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#757575");
        this.setTooltip("Add a comment to your code");
        this.setHelpUrl("");
    }
};

// ===== Initialize custom blocks =====
function initializeCustomBlocks() {
    // This function can be called to ensure all blocks are properly registered
    console.log("Custom hardware blocks initialized");
}

// Call initialization when script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCustomBlocks();
});