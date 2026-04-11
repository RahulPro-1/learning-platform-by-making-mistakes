/**
 * practiceQuestions.js
 * Structured practice exercises with broken code, hints, and solutions.
 * Used via GET /api/practice
 */

const PRACTICE_QUESTIONS = [
  // ─── Python · Basic ────────────────────────────────────────────────────────
  {
    id: 'pq_py_1',
    difficulty: 'basic',
    language: 'python',
    title: 'Fix the Missing Colon',
    description:
      'This if-statement is missing a colon at the end. Fix the SyntaxError without changing the logic.',
    errorType: 'SyntaxError',
    brokenCode: `age = 20

if age >= 18
    print("You can vote!")
else:
    print("Too young to vote.")`,
    hints: [
      'Python if-statements always need a colon at the end of the line.',
      'Look at line 3 — what is missing at the very end?',
    ],
    solution: `age = 20

if age >= 18:
    print("You can vote!")
else:
    print("Too young to vote.")`,
  },
  {
    id: 'pq_py_2',
    difficulty: 'basic',
    language: 'python',
    title: 'Fix the Indentation Error',
    description:
      'The code block inside the function is not indented. Fix the IndentationError.',
    errorType: 'IndentationError',
    brokenCode: `def say_hello(name):
print("Hello, " + name + "!")
print("Nice to meet you!")

say_hello("Alice")`,
    hints: [
      'After a `def` line ending with `:`, the next lines must be indented.',
      'Add 4 spaces before both print statements inside the function.',
    ],
    solution: `def say_hello(name):
    print("Hello, " + name + "!")
    print("Nice to meet you!")

say_hello("Alice")`,
  },
  {
    id: 'pq_py_3',
    difficulty: 'basic',
    language: 'python',
    title: 'Fix the String + Number Error',
    description:
      'The code tries to join a string and an integer with `+`. Fix the TypeError.',
    errorType: 'TypeError',
    brokenCode: `score = 95
grade = "A"
print("Your score is: " + score)
print("Your grade is: " + grade)`,
    hints: [
      'You cannot use `+` to join a string and an integer directly.',
      'Wrap the integer in `str()` to convert it to a string first.',
    ],
    solution: `score = 95
grade = "A"
print("Your score is: " + str(score))
print("Your grade is: " + grade)`,
  },
  {
    id: 'pq_py_4',
    difficulty: 'intermediate',
    language: 'python',
    title: 'Fix the Scope Error',
    description:
      'A variable defined inside a function is used outside it. Fix the NameError.',
    errorType: 'NameError',
    brokenCode: `def calculate_area(radius):
    area = 3.14 * radius * radius

calculate_area(5)
print("Area:", area)   # 'area' is not accessible here!`,
    hints: [
      "Variables defined inside a function are 'local' — they can't be used outside.",
      'Make the function `return` the value, then store it in a variable outside.',
    ],
    solution: `def calculate_area(radius):
    area = 3.14 * radius * radius
    return area

result = calculate_area(5)
print("Area:", result)`,
  },
  {
    id: 'pq_py_5',
    difficulty: 'intermediate',
    language: 'python',
    title: 'Fix the Infinite Loop',
    description:
      'The while-loop runs forever. Fix it so it counts from 1 to 5 and stops.',
    errorType: 'LogicError',
    brokenCode: `count = 1
while count <= 5:
    print("Count:", count)
    count -= 1   # Bug: counter goes backwards!`,
    hints: [
      'The loop condition checks `count <= 5`.',
      'For the loop to stop, `count` must increase toward 5, not decrease.',
      'Change `-= 1` to `+= 1`.',
    ],
    solution: `count = 1
while count <= 5:
    print("Count:", count)
    count += 1`,
  },

  // ─── C · Basic ─────────────────────────────────────────────────────────────
  {
    id: 'pq_c_1',
    difficulty: 'basic',
    language: 'c',
    title: 'Fix the Missing Semicolon',
    description: 'One statement is missing its semicolon. Find and fix it.',
    errorType: 'SyntaxError',
    brokenCode: `#include <stdio.h>

int main() {
    int x = 5
    int y = 10;
    printf("Sum = %d\\n", x + y);
    return 0;
}`,
    hints: [
      'Every statement in C must end with a semicolon.',
      'Check line 4 — is there a semicolon after the value 5?',
    ],
    solution: `#include <stdio.h>

int main() {
    int x = 5;
    int y = 10;
    printf("Sum = %d\\n", x + y);
    return 0;
}`,
  },
  {
    id: 'pq_c_2',
    difficulty: 'basic',
    language: 'c',
    title: 'Fix the Undeclared Variable',
    description: 'A variable is used without being declared. Fix the error.',
    errorType: 'UndeclaredError',
    brokenCode: `#include <stdio.h>

int main() {
    number = 42;
    printf("Number = %d\\n", number);
    return 0;
}`,
    hints: [
      'In C, every variable must have a type declared before it can be used.',
      "Add `int` before `number` to declare it as an integer.",
    ],
    solution: `#include <stdio.h>

int main() {
    int number = 42;
    printf("Number = %d\\n", number);
    return 0;
}`,
  },
  {
    id: 'pq_c_3',
    difficulty: 'basic',
    language: 'c',
    title: 'Fix the Missing Closing Brace',
    description: 'A `}` is missing for the for-loop body. Fix the SyntaxError.',
    errorType: 'SyntaxError',
    brokenCode: `#include <stdio.h>

int main() {
    int i;
    for (i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);

    return 0;
}`,
    hints: [
      'Every `{` must have a matching `}`.',
      'The for-loop body is missing its closing `}` before the `return` statement.',
    ],
    solution: `#include <stdio.h>

int main() {
    int i;
    for (i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);
    }
    return 0;
}`,
  },
  {
    id: 'pq_c_4',
    difficulty: 'intermediate',
    language: 'c',
    title: 'Fix the Format Specifiers',
    description:
      'The printf format specifiers do not match the variable types. Fix both lines.',
    errorType: 'Warning',
    brokenCode: `#include <stdio.h>

int main() {
    float temperature = 36.5;
    int students = 30;

    printf("Temperature: %d degrees\\n", temperature);
    printf("Students: %f\\n", students);
    return 0;
}`,
    hints: [
      'Use `%f` for float/double values.',
      'Use `%d` for integer values.',
      'Which specifier goes with which variable?',
    ],
    solution: `#include <stdio.h>

int main() {
    float temperature = 36.5;
    int students = 30;

    printf("Temperature: %f degrees\\n", temperature);
    printf("Students: %d\\n", students);
    return 0;
}`,
  },

  // ─── C++ · Intermediate ────────────────────────────────────────────────────
  {
    id: 'pq_cpp_1',
    difficulty: 'intermediate',
    language: 'cpp',
    title: 'Fix the Infinite Loop',
    description:
      'The countdown loop runs forever because the counter goes the wrong direction.',
    errorType: 'LogicError',
    brokenCode: `#include <iostream>
using namespace std;

int main() {
    int countdown = 10;
    while (countdown > 0) {
        cout << "Countdown: " << countdown << endl;
        countdown++;   // Bug is here!
    }
    cout << "Blast off!" << endl;
    return 0;
}`,
    hints: [
      'The loop condition checks `countdown > 0`.',
      'For a countdown, the value should decrease, not increase.',
      "Change `++` to `--`.",
    ],
    solution: `#include <iostream>
using namespace std;

int main() {
    int countdown = 10;
    while (countdown > 0) {
        cout << "Countdown: " << countdown << endl;
        countdown--;
    }
    cout << "Blast off!" << endl;
    return 0;
}`,
  },
  {
    id: 'pq_cpp_2',
    difficulty: 'intermediate',
    language: 'cpp',
    title: 'Fix the Missing Return',
    description:
      'The `add()` function is declared to return `int` but never returns a value.',
    errorType: 'Warning',
    brokenCode: `#include <iostream>
using namespace std;

int add(int a, int b) {
    int result = a + b;
    // Missing return statement!
}

int main() {
    cout << "5 + 3 = " << add(5, 3) << endl;
    return 0;
}`,
    hints: [
      "The function `add()` says it will return an `int` but never does.",
      "Add `return result;` at the end of the function body.",
    ],
    solution: `#include <iostream>
using namespace std;

int add(int a, int b) {
    int result = a + b;
    return result;
}

int main() {
    cout << "5 + 3 = " << add(5, 3) << endl;
    return 0;
}`,
  },
  {
    id: 'pq_cpp_3',
    difficulty: 'advanced',
    language: 'cpp',
    title: 'Fix the Comparison Operator',
    description:
      'Assignment `=` is used where comparison `==` is needed, creating a logic bug.',
    errorType: 'LogicError',
    brokenCode: `#include <iostream>
using namespace std;

int main() {
    int x = 5;

    if (x = 10) {   // Bug: should be == not =
        cout << "x is 10" << endl;
    } else {
        cout << "x is not 10" << endl;
    }
    return 0;
}`,
    hints: [
      '`=` assigns a value; `==` compares two values.',
      'Inside an `if(...)`, you almost always want `==` to check equality.',
      'What happens when you assign 10 to x inside the if condition?',
    ],
    solution: `#include <iostream>
using namespace std;

int main() {
    int x = 5;

    if (x == 10) {
        cout << "x is 10" << endl;
    } else {
        cout << "x is not 10" << endl;
    }
    return 0;
}`,
  },
];

module.exports = { PRACTICE_QUESTIONS };
