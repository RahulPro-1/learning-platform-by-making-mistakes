/**
 * beginnerHints.js
 * Maps compiler/interpreter error patterns → beginner-friendly info.
 * Each entry has:
 *   name          — short human title shown in the UI  e.g. "Missing Semicolon"
 *   type          — error category label               e.g. "Syntax Error"
 *   explanation   — plain-English "what went wrong"
 *   hint          — how to fix it (no full solution)
 *   whyItHappens  — root-cause explanation for beginners
 */

const ERROR_PATTERNS = [

  // ─── C / C++ ───────────────────────────────────────────────────────────────

  {
    id: 'missing_semicolon',
    name: 'Missing Semicolon',
    patterns: [
      /expected\s*',' or\s*';'/i,
      /expected\s*';'\s*before/i,
      /expected\s*';'/i,
      /missing\s*';'/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'A statement in your code is missing a semicolon (;) at the end. Every statement in C/C++ must end with a semicolon.',
    hint: 'Go to the line number shown and add a semicolon (;) at the very end of that statement.',
    whyItHappens: 'C/C++ uses semicolons to mark the end of each instruction. Without one, the compiler cannot tell where one statement ends and the next begins.',
    miniFixExample: 'printf("Hello")  →  printf("Hello");',
  },

  {
    id: 'missing_closing_brace',
    name: 'Missing Closing Brace }',
    patterns: [
      /expected\s*'}'\s*at\s*end\s*of\s*input/i,
      /expected\s*'}'\s*before/i,
      /expected\s*'\}'/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'A closing curly brace `}` is missing. Every `{` you open must have a matching `}` to close it.',
    hint: 'Count your `{` and `}` braces. Make sure they match — especially at the end of functions, loops, and if-blocks.',
    whyItHappens: 'Curly braces define code blocks. An unclosed `{` means the compiler keeps reading past where you expected the block to end.',
    miniFixExample: 'int main() {  →  int main() { ... }',
  },

  {
    id: 'missing_paren',
    name: 'Missing Parenthesis',
    patterns: [
      /expected\s*'\)'/i,
      /expected\s*'\('/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'A parenthesis `(` or `)` is missing or in the wrong place.',
    hint: 'Check your function calls and `if`/`while` conditions. Every `(` must have a matching `)`.',
    whyItHappens: 'Parentheses must always come in matched pairs. A missing one causes the compiler to misread your entire expression.',
    miniFixExample: 'if x > 0 {  →  if (x > 0) {',
  },

  {
    id: 'undeclared_variable',
    name: 'Variable Not Declared',
    patterns: [
      /undeclared\s*\(first\s*use\s*in\s*this\s*function\)/i,
      /was\s*not\s*declared\s*in\s*this\s*scope/i,
      /use\s*of\s*undeclared\s*identifier/i,
    ],
    language: ['c', 'cpp'],
    type: 'Undeclared Variable',
    explanation: 'You used a variable that was never declared. You must declare a variable before you can use it.',
    hint: 'Add a declaration before you use the variable — for example: `int score;` or `int score = 0;`',
    whyItHappens: 'In C/C++ you must tell the compiler the name AND type of every variable before using it. The compiler has no way to guess the type on its own.',
    miniFixExample: 'score = 10;  →  int score = 10;',
  },

  {
    id: 'undefined_reference',
    name: 'Undefined Function Reference',
    patterns: [
      /undefined\s*reference\s*to/i,
      /unresolved\s*external\s*symbol/i,
    ],
    language: ['c', 'cpp'],
    type: 'Linker Error',
    explanation: 'You called a function that has no definition, or you misspelled the function name.',
    hint: 'Check that you defined the function body (not just declared it) and that the spelling matches exactly.',
    whyItHappens: 'After compiling, the linker connects function calls to their code. If it cannot find a matching definition, you get this error.',
    miniFixExample: 'void add();  →  void add() { /* write body here */ }',
  },

  {
    id: 'implicit_declaration',
    name: 'Function Used Without Including Header',
    patterns: [
      /implicit\s*declaration\s*of\s*function/i,
      /incompatible\s*implicit\s*declaration\s*of\s*built-in\s*function/i,
    ],
    language: ['c', 'cpp'],
    type: 'Missing Header Warning',
    explanation: 'You used a built-in function (like `printf`) without including its header file at the top.',
    hint: 'Add the correct `#include` at the top — e.g. `#include <stdio.h>` for printf, `#include <math.h>` for sqrt.',
    whyItHappens: 'Functions like printf are defined in library files. Without including the right header, the compiler does not know the function exists.',
    miniFixExample: '(missing top line)  →  #include <stdio.h>',
  },

  {
    id: 'incompatible_types',
    name: 'Wrong Data Type Used',
    patterns: [
      /incompatible\s*types/i,
      /cannot\s*convert/i,
      /invalid\s*conversion\s*from/i,
    ],
    language: ['c', 'cpp'],
    type: 'Type Error',
    explanation: 'You are trying to store or use a value of the wrong type — for example, putting text into a number variable.',
    hint: 'Check both sides of the assignment. Make sure the types match (e.g., do not assign a float to an int without a cast).',
    whyItHappens: 'C/C++ is strongly typed — every variable has one fixed type. Mixing types without conversion causes this error.',
    miniFixExample: 'int x = 3.14;  →  float x = 3.14;',
  },

  {
    id: 'scanf_missing_ampersand',
    name: "Missing '&' in scanf",
    patterns: [
      /format\s*'%\w+'\s*expects\s*argument\s*of\s*type\s*'[^']*\s*\*'/i,
    ],
    language: ['c', 'cpp'],
    type: 'Format Warning',
    explanation: "You forgot the `&` (ampersand) before a variable in `scanf`. Without it, `scanf` receives the variable's value instead of its memory address.",
    hint: "Add `&` before each variable in `scanf` — e.g. `scanf(\"%d\", &num)` not `scanf(\"%d\", num)`.",
    whyItHappens: "`scanf` needs to write into a variable, so it needs the address of that variable. The `&` operator gives the address. Without it, `scanf` writes to a random memory location and your variable stays unchanged.",
    miniFixExample: 'scanf("%d", num)  →  scanf("%d", &num)',
  },

  {
    id: 'too_many_format_args',
    name: "Missing '%' in Format String (Extra Arguments Ignored)",
    patterns: [
      /too\s*many\s*arguments\s*for\s*format/i,
    ],
    language: ['c', 'cpp'],
    type: 'Format Warning',
    explanation: "You passed more variables to `printf`/`scanf` than you have `%` placeholders in the format string.",
    hint: "Check your format string — you probably wrote `\"d\"` instead of `\"%d\"`. Every variable needs a matching `%` specifier: `%d` for int, `%f` for float, `%s` for string.",
    whyItHappens: "`printf`/`scanf` reads the format string and uses one `%` placeholder per variable argument. Extra arguments with no matching `%` are silently ignored, so your variable is never printed or read.",
    miniFixExample: 'printf("d", num)  →  printf("%d", num)',
  },

  {
    id: 'format_mismatch',
    name: 'Wrong printf/scanf Format Specifier',
    patterns: [
      /format\s*'%\w+'\s*expects\s*argument\s*of\s*type/i,
      /format\s*specifies\s*type/i,
    ],
    language: ['c', 'cpp'],
    type: 'Format Warning',
    explanation: 'The format specifier in your `printf` or `scanf` does not match the type of the variable you passed.',
    hint: 'Use `%d` for int, `%f` for float/double, `%lf` for double in scanf, `%c` for char, `%s` for string.',
    whyItHappens: '`printf`/`scanf` use format codes to know how to handle each value. Using the wrong code prints garbage or causes undefined behaviour.',
    miniFixExample: 'printf("%d", 3.14)  →  printf("%f", 3.14)',
  },

  {
    id: 'missing_terminating_quote',
    name: 'Missing Closing Quote in String',
    patterns: [
      /missing\s*terminating\s*"\s*character/i,
      /unterminated\s*string\s*constant/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'You opened a string with `"` but never closed it with a matching `"`. The compiler cannot find the end of the string.',
    hint: 'Find the string on the indicated line and add a closing `"` at the end — e.g. `"hello"` not `"hello`.',
    whyItHappens: 'Strings in C must be wrapped in a matching pair of double quotes. Without the closing `"`, the compiler keeps reading everything as part of the string, causing cascading errors.',
    miniFixExample: 'printf("Hello)  →  printf("Hello")',
  },

  {
    id: 'missing_opening_quote',
    name: 'Missing Opening Quotation Mark',
    patterns: [
      /expected\s+'\)'\s+before\s+'"'\s+token/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'You forgot the opening `"` before your string. The compiler reads your text as a variable name and then gets confused by the `"` that appears later.',
    hint: 'Add `"` at the very START of your string. Every string needs an opening `"` and a closing `"`.',
    whyItHappens: 'In C, strings must be surrounded by double quotes on both sides. Without the opening `"`, C reads your text as an unknown variable name.',
    miniFixExample: 'printf(Hello")  →  printf("Hello")',
  },

  {
    id: 'no_main_function',
    name: 'Missing main() Function',
    patterns: [
      /undefined\s*reference\s*to\s*[`'"]?WinMain/i,
      /undefined\s*reference\s*to\s*[`'"]?main/i,
      /ld\s*returned\s*1\s*exit\s*status/i,
    ],
    language: ['c', 'cpp'],
    type: 'Linker Error',
    explanation: 'Your program has no `main()` function. Every C/C++ program must have exactly one `main()` — it is the entry point where execution starts.',
    hint: 'Add `int main() { ... return 0; }` to your file. All your program logic should go inside it.',
    whyItHappens: "The operating system looks for a function called `main` to start your program. If it doesn't exist, the linker cannot build an executable.",
    miniFixExample: '(missing)  →  int main() { return 0; }',
  },

  {
    id: 'void_main',
    name: "Use 'int main()' not 'void main()'",
    patterns: [
      /return\s*type\s*of\s*'main'\s*is\s*not\s*'int'/i,
    ],
    language: ['c', 'cpp'],
    type: 'Return Type Warning',
    explanation: "You declared `void main()` but the correct signature is `int main()`. The `main` function must return an `int` (exit code) to the operating system.",
    hint: "Change `void main()` to `int main()` and add `return 0;` at the end of the function.",
    whyItHappens: "By the C/C++ standard, `main` must return an `int`. Returning `0` means the program finished successfully. Some compilers accept `void main` but it is non-standard and causes warnings.",
    miniFixExample: 'void main()  →  int main()  (and add return 0; at end)',
  },

  {
    id: 'expected_expression',
    name: 'Incomplete Expression (Operator Without Operand)',
    patterns: [
      /expected\s*expression\s*before\s*'[;,)]/i,
      /expected\s*expression\s*at\s*end\s*of\s*input/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'The compiler found an operator (`+`, `-`, `*`, `%`, etc.) or a keyword with nothing after it — the expression is incomplete.',
    hint: 'Look at the indicated line for a dangling operator. For example `5 % ;` is missing the second operand — it should be `5 % 2`.',
    whyItHappens: 'Every operator needs values on both sides. When the compiler hits `;` or `)` where it expected a number or variable, it cannot complete the expression.',
    miniFixExample: 'int x = 5 % ;  →  int x = 5 % 2;',
  },

  {
    id: 'no_return',
    name: 'Function Missing Return Statement',
    patterns: [
      /control\s*reaches\s*end\s*of\s*non-void\s*function/i,
      /missing\s*return\s*statement/i,
      /non-void\s*function\s*does\s*not\s*return\s*a\s*value/i,
    ],
    language: ['c', 'cpp'],
    type: 'Missing Return Warning',
    explanation: 'Your function is supposed to return a value (like `int` or `float`) but it has no `return` statement.',
    hint: 'Add `return <value>;` at the end of your function. Example: `return result;` or `return 0;`',
    whyItHappens: 'When a function declares a return type other than `void`, it must always hand a value back to the caller using `return`.',
    miniFixExample: '... }  →  ... return result; }',
  },

  {
    id: 'lvalue_required',
    name: 'Invalid Assignment ( = vs == )',
    patterns: [
      /lvalue\s*required\s*as\s*left\s*operand/i,
      /expression\s*is\s*not\s*assignable/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'You tried to assign a value to something that cannot hold one — most often caused by using `==` instead of `=`, or vice versa.',
    hint: 'Use `=` to assign (e.g., `x = 5`). Use `==` to compare inside conditions (e.g., `if (x == 5)`).',
    whyItHappens: 'The left side of `=` must be a variable. Writing something like `5 = x` or accidentally comparing when you meant to assign triggers this error.',
    miniFixExample: '5 = x;  →  x = 5;',
  },

  {
    id: 'else_without_if',
    name: 'else Without Matching if',
    patterns: [
      /'else'\s*without\s*a\s*previous\s*'if'/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: 'You have an `else` block that does not have a matching `if` above it.',
    hint: 'Check for an accidental semicolon right after `if(...)` — writing `if (...);` creates an empty if-body and leaves `else` unmatched.',
    whyItHappens: 'A common beginner mistake: `if (x > 0);` ends the if immediately with a semicolon, so the `else` below has no `if` to pair with.',
    miniFixExample: 'if (x > 0);  →  if (x > 0)  (remove the semicolon)',
  },

  {
    id: 'conflicting_types',
    name: 'Variable Declared Twice with Different Types',
    patterns: [
      /conflicting\s*types\s*for/i,
      /redeclared\s*as\s*different\s*kind\s*of\s*symbol/i,
    ],
    language: ['c', 'cpp'],
    type: 'Redeclaration Error',
    explanation: 'The same variable or function name has been declared more than once with different types.',
    hint: 'Remove the duplicate declaration or make sure both use exactly the same type.',
    whyItHappens: 'You can only declare a name once in the same scope. Declaring it again with a different type confuses the compiler.',
    miniFixExample: 'int x = 5;\nfloat x = 3.14;  →  float x = 3.14;  (keep only one)',
  },

  {
    id: 'division_by_zero',
    name: 'Division by Zero',
    patterns: [
      /division\s*by\s*zero/i,
    ],
    language: ['c', 'cpp'],
    type: 'Runtime Warning',
    explanation: 'Your code divides a number by zero, which is mathematically impossible.',
    hint: 'Before dividing, check that the denominator is not zero: `if (b != 0) { result = a / b; }`',
    whyItHappens: 'Dividing by zero is undefined. In C/C++ this causes a crash or unpredictable output at runtime.',
    miniFixExample: 'result = a / 0;  →  if (b != 0) result = a / b;',
  },

  {
    id: 'missing_hash_include',
    name: "Missing '#' on #include",
    patterns: [
      /expected\s*'=',\s*',',\s*';',\s*'asm'\s*or\s*'__attribute__'\s*before\s*'<'\s*token/i,
      /expected\s*[^']*before\s*'<'\s*token/i,
    ],
    language: ['c', 'cpp'],
    type: 'Syntax Error',
    explanation: "You wrote `include <...>` but forgot the `#` at the start. Every header include must begin with `#include`.",
    hint: "Change `include <stdio.h>` to `#include <stdio.h>`. The `#` is required — it tells the compiler this is a preprocessor directive, not a function call.",
    whyItHappens: "Without the `#`, the compiler reads `include` as an unknown variable name and then gets confused by the `<` that follows, producing this cryptic error.",
    miniFixExample: 'include <stdio.h>  →  #include <stdio.h>',
  },

  {
    id: 'unused_variable',
    name: 'Unused Variable',
    patterns: [
      /unused\s*variable/i,
      /set\s*but\s*not\s*used/i,
    ],
    language: ['c', 'cpp'],
    type: 'Unused Code Warning',
    explanation: 'You declared a variable but never used it anywhere in your program.',
    hint: 'Either use the variable in your code, or delete the declaration if you no longer need it.',
    whyItHappens: 'Unused variables are often a sign of a forgotten step or a typo — you may have meant to use the variable but used a different name instead.',
    miniFixExample: 'int x = 5;  (never used)  →  printf("%d", x);  or remove it',
  },

  // ─── Python ────────────────────────────────────────────────────────────────

  {
    id: 'py_missing_colon',
    name: 'Missing Colon ( : )',
    patterns: [
      /SyntaxError:\s*expected\s*':'/i,
      /SyntaxError:.*after\s*(if|else|elif|for|while|def|class)/i,
    ],
    language: ['python'],
    type: 'Syntax Error',
    explanation: 'A colon `:` is missing at the end of an `if`, `for`, `while`, `def`, or `class` line.',
    hint: 'Add `:` at the very end of that line. Example: `if x > 0:` or `def my_function():`',
    whyItHappens: 'In Python, a colon signals that a block of code is about to start. Without it, Python does not know a block is coming.',
    miniFixExample: 'if x > 0  →  if x > 0:',
  },

  {
    id: 'py_invalid_syntax',
    name: 'Invalid Syntax',
    patterns: [
      /SyntaxError:\s*invalid\s*syntax/i,
    ],
    language: ['python'],
    type: 'Syntax Error',
    explanation: 'Python found code it cannot understand. Something is written incorrectly on or near the indicated line.',
    hint: 'Check the line Python points to for missing colons, mismatched brackets, or a misspelled keyword like `pint` instead of `print`.',
    whyItHappens: 'Python reads your code top to bottom. When it hits something that breaks its grammar rules, it stops and reports a syntax error.',
    miniFixExample: 'pint("Hello")  →  print("Hello")',
  },

  {
    id: 'py_indentation_expected',
    name: 'Missing Indentation',
    patterns: [
      /IndentationError:\s*expected\s*an\s*indented\s*block/i,
    ],
    language: ['python'],
    type: 'Indentation Error',
    explanation: 'After a colon `:`, the next line must be indented (shifted right with spaces), but it is not.',
    hint: 'Add 4 spaces at the beginning of the lines inside your `if`, `for`, `while`, or `def` block.',
    whyItHappens: 'Python uses indentation (spaces at the start of lines) to define code blocks, instead of `{}` like C. Every line inside a block must be indented.',
    miniFixExample: 'def hello():\nprint("Hi")  →  def hello():\n    print("Hi")',
  },

  {
    id: 'py_unexpected_indent',
    name: 'Unexpected Indentation',
    patterns: [
      /IndentationError:\s*unexpected\s*indent/i,
    ],
    language: ['python'],
    type: 'Indentation Error',
    explanation: 'A line has more indentation than expected — it is shifted right when it should not be.',
    hint: 'Remove the extra spaces from the beginning of that line, or check if the line above is missing a colon.',
    whyItHappens: 'Python is very strict about indentation. A line should only be indented if it belongs inside an `if`, `for`, `def`, or similar block.',
    miniFixExample: '    x = 5  (wrong indent)  →  x = 5',
  },

  {
    id: 'py_name_error',
    name: 'Variable / Function Not Found',
    patterns: [
      /NameError:\s*name\s*'.+'\s*is\s*not\s*defined/i,
    ],
    language: ['python'],
    type: 'Name Error',
    explanation: 'You used a variable or function name that Python does not recognise — it either does not exist yet or is misspelled.',
    hint: 'Check the spelling carefully. Make sure the variable was assigned a value before this line.',
    whyItHappens: 'Python looks up each name exactly when that line runs. If the name was never assigned or is misspelled, Python cannot find it.',
    miniFixExample: 'print(scor)  →  print(score)  # fix the spelling',
  },

  {
    id: 'py_type_concat',
    name: 'Cannot Mix String and Number with +',
    patterns: [
      /TypeError:\s*can\s*only\s*concatenate\s*str\s*\(not\s*"int"\)/i,
      /TypeError:\s*unsupported\s*operand.*str.*int/i,
    ],
    language: ['python'],
    type: 'Type Error',
    explanation: 'You tried to join a string and a number using `+`, which Python does not allow directly.',
    hint: 'Wrap the number in `str()` to convert it first — e.g. `"Score: " + str(score)` or use an f-string: `f"Score: {score}"`',
    whyItHappens: "Python's `+` operator either adds numbers or joins strings, but cannot mix the two types without an explicit conversion.",
    miniFixExample: '"Score: " + score  →  "Score: " + str(score)',
  },

  {
    id: 'py_type_error',
    name: 'Wrong Data Type Used',
    patterns: [
      /TypeError:/i,
    ],
    language: ['python'],
    type: 'Type Error',
    explanation: 'You used a value of the wrong type in an operation or passed the wrong type to a function.',
    hint: 'Check the types of your variables. You may need to convert them using `int()`, `str()`, or `float()`.',
    whyItHappens: "Python's operations and functions expect specific types. Passing the wrong type raises this error.",
    miniFixExample: '"5" + 3  →  int("5") + 3',
  },

  {
    id: 'py_zero_division',
    name: 'Division by Zero',
    patterns: [
      /ZeroDivisionError/i,
      /division\s*by\s*zero/i,
    ],
    language: ['python'],
    type: 'Runtime Error',
    explanation: 'Your code tried to divide a number by zero, which is mathematically impossible.',
    hint: 'Check the divisor before dividing: `if b != 0: result = a / b`',
    whyItHappens: 'Division by zero is undefined in mathematics. Python raises this error immediately to prevent wrong results.',
    miniFixExample: 'result = a / 0  →  if b != 0: result = a / b',
  },

  {
    id: 'py_index_error',
    name: 'List Index Out of Range',
    patterns: [
      /IndexError:\s*list\s*index\s*out\s*of\s*range/i,
    ],
    language: ['python'],
    type: 'Index Error',
    explanation: 'You tried to access a list item at a position that does not exist.',
    hint: 'List indices start at 0. A list with 3 items has valid indices 0, 1, and 2. Check your index value.',
    whyItHappens: "Lists have a fixed number of items. Trying to access an index beyond the last item is like reaching for a shelf that isn't there.",
    miniFixExample: 'items[5]  (only 3 items exist)  →  items[2]',
  },

  {
    id: 'py_unclosed_string',
    name: 'Unclosed String (Missing Quote)',
    patterns: [
      /SyntaxError:\s*EOL\s*while\s*scanning\s*string\s*literal/i,
      /SyntaxError:\s*unterminated\s*string/i,
    ],
    language: ['python'],
    type: 'Syntax Error',
    explanation: 'You opened a string with a quote but never closed it with a matching quote.',
    hint: "Make sure every string has both an opening and closing quote — either `'...'` or `\"...\"`.",
    whyItHappens: 'Python reads a string until it finds the closing quote. If it reaches the end of the line first, it raises this error.',
    miniFixExample: 'print("Hello)  →  print("Hello")',
  },

  {
    id: 'py_unclosed_paren',
    name: 'Unclosed Bracket ( or [ or {',
    patterns: [
      /SyntaxError:.*was\s*never\s*closed/i,
    ],
    language: ['python'],
    type: 'Syntax Error',
    explanation: 'You opened a bracket `(`, `[`, or `{` but never closed it.',
    hint: 'Find the opening bracket Python points to and add the correct closing bracket `)`, `]`, or `}`.',
    whyItHappens: 'Python tracks all open brackets and expects every one to be closed. An unclosed bracket causes Python to keep reading, usually causing a confusing error on the next line.',
    miniFixExample: 'print("Hello"  →  print("Hello")',
  },

  {
    id: 'py_attribute_error',
    name: 'Method or Property Does Not Exist',
    patterns: [
      /AttributeError/i,
    ],
    language: ['python'],
    type: 'Attribute Error',
    explanation: 'You tried to use a method or property that does not exist on that type of object.',
    hint: 'Double-check the method name spelling. Also verify the variable holds the type you think it does.',
    whyItHappens: 'Every Python object has a specific set of methods. Calling one that does not exist raises AttributeError.',
    miniFixExample: '"hello".uppr()  →  "hello".upper()',
  },

  {
    id: 'py_import_error',
    name: 'Module Not Found (Import Error)',
    patterns: [
      /ImportError:\s*No\s*module\s*named/i,
      /ModuleNotFoundError/i,
    ],
    language: ['python'],
    type: 'Import Error',
    explanation: 'Python could not find the library (module) you tried to import.',
    hint: 'Check the spelling of the module name. If it is a third-party library, install it with: `pip install <module-name>`',
    whyItHappens: 'Python can only import modules that are installed or part of its standard library. A typo or missing installation causes this error.',
    miniFixExample: 'import maths  →  import math',
  },

  {
    id: 'py_recursion_error',
    name: 'Infinite Recursion (Function Calling Itself Forever)',
    patterns: [
      /RecursionError/i,
      /maximum\s*recursion\s*depth\s*exceeded/i,
    ],
    language: ['python'],
    type: 'Recursion Error',
    explanation: 'Your function keeps calling itself endlessly and never stops.',
    hint: 'Add a base case — a condition that stops the recursion. Example: `if n == 0: return 0`',
    whyItHappens: 'A recursive function must have a stopping condition. Without one, it calls itself forever until Python runs out of memory.',
    miniFixExample: 'def f(n): return f(n-1)  →  def f(n):\n    if n == 0: return 0\n    return f(n-1)',
  },
];

/**
 * Find the best matching hint entry for a given raw error message.
 * @param {string} message - raw compiler/interpreter error text
 * @param {string} language - 'c', 'cpp', or 'python'
 * @returns {object|null}
 */
const matchHint = (message, language) => {
  for (const entry of ERROR_PATTERNS) {
    if (entry.language && !entry.language.includes(language)) continue;
    for (const pattern of entry.patterns) {
      if (pattern.test(message)) return entry;
    }
  }
  return null;
};

module.exports = { matchHint, ERROR_PATTERNS };
