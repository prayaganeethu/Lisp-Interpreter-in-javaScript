# Lisp-Interpreter-in-javaScript

Parses and evaluates lisp program on the go.

Run REPL.js, Type 'exit' to exit the "READ EVAL PRINT LOOP"

Sample Input - Output :
(define r 2)
Result: null

(define sum (lambda (c) (+ c r)))
Result: null

(sum 2)
Result: 4

(if (> 2 3) 2 3)
Result: 3

(set! r (+ r 10))
Result: null

(+ r 10)
Result: 22
