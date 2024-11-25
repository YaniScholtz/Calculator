
function evaluate(expression) {
    // Replace 'e' with Math.E for Euler's number constant
    expression = expression.replace(/\be\b/g, Math.E);

    // Handle 'e^x' (e raised to the power of x)
    expression = expression.replace(/e\^([^\(\)]+)/g, (match, p1) => {
        return Math.pow(Math.E, parseFloat(p1)); // e^x is handled as Math.E^x
    });

    const functionRegex = /([a-zA-Z]+)\(([^)]+)\)/g;
    let match;

    // Resolve functions first (sqrt, sin, cos, etc.)
    while ((match = functionRegex.exec(expression))) {
        const functionName = match[1];
        const arg = parseFloat(evaluate(match[2])); // Recursively evaluate the argument

        let result;
        switch (functionName) {
            case "sqrt":
                result = Math.sqrt(arg);
                break;
            case "sin":
                result = Math.sin(arg);
                break;
            case "cos":
                result = Math.cos(arg);
                break;
            case "tan":
                result = Math.tan(arg);
                break;
            case "log":
                result = Math.log10(arg);
                break;
            case "exp":
                result = Math.exp(arg);
                break;
            default:
                throw new Error(`Unknown function: ${functionName}`);
        }

        expression = expression.replace(match[0], result.toString());
    }

    // Handle parentheses (recursively evaluate sub-expressions)
    while (expression.includes("(")) {
        expression = expression.replace(/\(([^()]+)\)/g, (_, subExpression) =>
            evaluate(subExpression)
        );
    }

    // Adjust expression to handle negative numbers properly
    expression = expression.replace(/--/g, '+'); // Handle double negatives (e.g., --5 => +5)

    // Split into tokens (numbers, operators, and parentheses)
    const tokens = expression.split(/([\+\-\*\/\^()])/).filter(Boolean);

    // Precedence for operators
    const precedence = { "^": 3, "*": 2, "/": 2, "+": 1, "-": 1 };

    const output = [];
    const operators = [];

    tokens.forEach((token, index) => {
        // Handle negative numbers
        if (token === "-" && (index === 0 || operators.length > 0 || tokens[index - 1] === "(")) {
            // Treat "-" as part of the number
            const nextToken = tokens[index + 1];
            if (nextToken && !isNaN(parseFloat(nextToken))) {
                // Modify next token to include negative sign
                tokens[index + 1] = "-" + nextToken;
                return; // Skip the "-" token as it has been absorbed into the next number
            }
        }

        // If token is a number, push it to the output
        if (!isNaN(parseFloat(token))) {
            output.push(parseFloat(token));
        } else if (token === "(") {
            operators.push(token);
        } else if (token === ")") {
            while (operators.length && operators[operators.length - 1] !== "(") {
                const op = operators.pop();
                const b = output.pop();
                const a = output.pop();
                output.push(applyOperator(a, b, op));
            }
            operators.pop(); // Pop the "("
        } else {
            while (operators.length &&
                precedence[operators[operators.length - 1]] >= precedence[token]) {
                const op = operators.pop();
                const b = output.pop();
                const a = output.pop();
                output.push(applyOperator(a, b, op));
            }
            operators.push(token); // Push current operator
        }
    });

    // Process any remaining operators
    while (operators.length) {
        const op = operators.pop();
        const b = output.pop();
        const a = output.pop();
        output.push(applyOperator(a, b, op));
    }

    return output[0]; // Return the result of the evaluated expression
}

function applyOperator(a, b, operator) {
    switch (operator) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        case "^":
            return Math.pow(a, b);
        default:
            return 0;
    }
}

function handleInput(input) {
    const display = document.getElementById("display");
    if (input === "=") {
        try {
            display.value = evaluate(display.value);
        } catch (err) {
            display.value = "Error";
        }
    } else if (input === "AC") {
        display.value = "";
    } else if (input === "DE") {
        display.value = display.value.slice(0, -1);
    } else {
        display.value += input;
    }
}