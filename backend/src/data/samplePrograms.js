/**
 * samplePrograms.js
 * Ready-to-load sample programs for the editor.
 * Used via GET /api/samples/:language
 */

const SAMPLE_PROGRAMS = {
  python: [
    {
      id: 'py_hello',
      title: 'Hello World',
      difficulty: 'basic',
      description: 'The classic first program — print a greeting to the screen.',
      code: `# Hello World in Python
name = "Student"
print("Hello, " + name + "!")
print("Welcome to Python programming.")`,
    },
    {
      id: 'py_calc',
      title: 'Simple Calculator',
      difficulty: 'basic',
      description: 'Add, subtract, multiply, and divide two numbers.',
      code: `# Simple Calculator
a = 10
b = 3

print("Addition:      ", a + b)
print("Subtraction:   ", a - b)
print("Multiplication:", a * b)
print("Division:      ", a / b)
print("Integer Div:   ", a // b)
print("Remainder:     ", a % b)`,
    },
    {
      id: 'py_missing_colon',
      title: '[Bug] Missing Colon',
      difficulty: 'basic',
      description: 'This if-statement is missing a colon. Find and fix it!',
      code: `# Fix the SyntaxError in this program
age = 18

if age >= 18
    print("You are an adult!")
else:
    print("You are a minor.")`,
    },
    {
      id: 'py_type_error',
      title: '[Bug] String + Number Error',
      difficulty: 'basic',
      description: 'Trying to add a string and a number causes a TypeError.',
      code: `# Fix the TypeError
score = 95
print("Your score is: " + score)   # Can't add str + int directly`,
    },
    {
      id: 'py_name_error',
      title: '[Bug] Undefined Variable',
      difficulty: 'basic',
      description: 'A variable name is misspelled. Can you spot the typo?',
      code: `# Fix the NameError — find the typo
def calculate_total(price, tax):
    total = price + tax
    return total

result = calculate_total(100, 15)
print("Total:", rezult)   # typo here!`,
    },
    {
      id: 'py_infinite_loop',
      title: '[Bug] Infinite Loop',
      difficulty: 'intermediate',
      description: 'This loop runs forever — fix the condition or update.',
      code: `# WARNING: This loop never ends!
# Fix the update statement so it stops at 5
count = 0
while count < 5:
    print("Count:", count)
    count -= 1   # Bug: should be += 1`,
    },
    {
      id: 'py_index_error',
      title: '[Bug] Index Out of Range',
      difficulty: 'intermediate',
      description: 'The loop index goes beyond the list length.',
      code: `# Fix the IndexError
fruits = ["apple", "banana", "cherry"]

# Bug: range(5) goes beyond index 2
for i in range(5):
    print(fruits[i])`,
    },
    {
      id: 'py_functions',
      title: 'Functions & Return Values',
      difficulty: 'intermediate',
      description: 'How to write functions that return values.',
      code: `# Functions with return values
def square(n):
    return n * n

def cube(n):
    return n * n * n

def is_even(n):
    return n % 2 == 0

print("5 squared:", square(5))
print("3 cubed:  ", cube(3))
print("4 is even:", is_even(4))
print("7 is even:", is_even(7))`,
    },
  ],

  c: [
    {
      id: 'c_hello',
      title: 'Hello World',
      difficulty: 'basic',
      description: 'The classic first C program.',
      code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to C programming.\\n");
    return 0;
}`,
    },
    {
      id: 'c_variables',
      title: 'Variables & Types',
      difficulty: 'basic',
      description: 'Declare and print different variable types in C.',
      code: `#include <stdio.h>

int main() {
    int age = 20;
    float gpa = 3.75;
    char grade = 'A';

    printf("Age:   %d\\n", age);
    printf("GPA:   %.2f\\n", gpa);
    printf("Grade: %c\\n", grade);
    return 0;
}`,
    },
    {
      id: 'c_missing_semicolon',
      title: '[Bug] Missing Semicolon',
      difficulty: 'basic',
      description: 'One statement is missing its semicolon. Find it!',
      code: `#include <stdio.h>

int main() {
    int x = 5
    int y = 10;
    printf("Sum = %d\\n", x + y);
    return 0;
}`,
    },
    {
      id: 'c_undeclared',
      title: '[Bug] Undeclared Variable',
      difficulty: 'basic',
      description: 'A variable is used without being declared.',
      code: `#include <stdio.h>

int main() {
    number = 42;           /* 'number' is not declared! */
    printf("Number = %d\\n", number);
    return 0;
}`,
    },
    {
      id: 'c_missing_brace',
      title: '[Bug] Missing Closing Brace',
      difficulty: 'basic',
      description: 'A closing `}` is missing for the for-loop.',
      code: `#include <stdio.h>

int main() {
    int i;
    for (i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);

    return 0;
}`,
    },
    {
      id: 'c_format_mismatch',
      title: '[Bug] Wrong Format Specifier',
      difficulty: 'intermediate',
      description: 'printf format specifiers do not match variable types.',
      code: `#include <stdio.h>

int main() {
    float temperature = 36.5;
    int students = 30;

    printf("Temperature: %d degrees\\n", temperature);  /* Wrong: float needs %f */
    printf("Students: %f\\n", students);                /* Wrong: int needs %d */
    return 0;
}`,
    },
    {
      id: 'c_loop',
      title: 'For Loop Example',
      difficulty: 'basic',
      description: 'Print numbers 1 to 10 using a for loop.',
      code: `#include <stdio.h>

int main() {
    int i;
    printf("Numbers from 1 to 10:\\n");
    for (i = 1; i <= 10; i++) {
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`,
    },
  ],

  cpp: [
    {
      id: 'cpp_hello',
      title: 'Hello World',
      difficulty: 'basic',
      description: 'The classic first C++ program.',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to C++ programming." << endl;
    return 0;
}`,
    },
    {
      id: 'cpp_missing_semicolon',
      title: '[Bug] Missing Semicolon',
      difficulty: 'basic',
      description: 'Find the missing semicolon in this program.',
      code: `#include <iostream>
using namespace std;

int main() {
    int num = 100
    cout << "Number: " << num << endl;
    return 0;
}`,
    },
    {
      id: 'cpp_undeclared',
      title: '[Bug] Variable Not Declared',
      difficulty: 'basic',
      description: 'A variable is used before being declared.',
      code: `#include <iostream>
using namespace std;

int main() {
    result = 10 + 20;   // 'result' is not declared
    cout << "Result: " << result << endl;
    return 0;
}`,
    },
    {
      id: 'cpp_infinite_loop',
      title: '[Bug] Infinite Loop',
      difficulty: 'intermediate',
      description: 'The counter goes in the wrong direction — fix it.',
      code: `#include <iostream>
using namespace std;

int main() {
    int countdown = 10;
    while (countdown > 0) {
        cout << "Countdown: " << countdown << endl;
        countdown++;   // Bug: should be countdown--
    }
    cout << "Blast off!" << endl;
    return 0;
}`,
    },
    {
      id: 'cpp_missing_return',
      title: '[Bug] Missing Return Statement',
      difficulty: 'intermediate',
      description: 'A function declared to return int never returns a value.',
      code: `#include <iostream>
using namespace std;

int add(int a, int b) {
    int result = a + b;
    // Missing: return result;
}

int main() {
    cout << "5 + 3 = " << add(5, 3) << endl;
    return 0;
}`,
    },
    {
      id: 'cpp_functions',
      title: 'Functions Example',
      difficulty: 'basic',
      description: 'Write and call simple C++ functions.',
      code: `#include <iostream>
using namespace std;

int square(int n) {
    return n * n;
}

bool isEven(int n) {
    return n % 2 == 0;
}

int main() {
    cout << "5 squared: " << square(5) << endl;
    cout << "4 is even: " << isEven(4) << endl;
    cout << "7 is even: " << isEven(7) << endl;
    return 0;
}`,
    },
  ],
};

module.exports = { SAMPLE_PROGRAMS };
