start
    = line

// lex

// tokens
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
// variable name rules
ATOM = [-_0-9a-zA-Z\.]
// ignore whitespace
ws "white space" = [ \t\r\n]* { return null }
// at least one SPACE must exist
sigws "significant white space" = [ \t\r\n]+ { return null }
// ignore comments
comment "comment" = "#" .* { return null }
// alias to whitespace
noop "no operation" = ws { return null }

iosym = '>' / '<' / '~>'
escape = "\\"
//template_quote = '`'
quotation_mark = '"'
single_quote = "'"
// for double quotes
// reason to use unicode literals is unknown
// will not function otherwise
unescaped = [^\0-\x1F\x22\x5C]
// for single quotes
unescapedS = [^\0-\x1F\x27]
// notTemplateQ = [^\x60]

// this rule maps to escape sequences for double quotes
char
  = unescaped
  / [ \r\n]
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b" }
      / "f" { return "\f" }
      / "n" { return "\n" }
      / "r" { return "\r" }
      / "t" { return "\t" }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16))
        }
    )
    { return sequence }

// redirect outputs to file, like bash
// e.g. echo 'hello, world' > hello # will write hellow to file, `hello`
// ATOM> is a special "named" fd or just a regular fd if DIGIT>
redirect "IO redirects"
    = ws dir:iosym file:var { return {
        dir: dir,
        file: file
      }}

// variable top rule
var "variable"
    = atom
    / quote_string
    / single_quote_string
    / dollarvar
//    / jstemp

// disabled for now
//jstemp "JavaScript Template String"
//    = ws template_quote string:notTemplateQ* template_quote ws { return {
//        type: 'template',
//        value: `(env_vars) => \`${string.join('')}\``
//      }}

// variables that should be replaced by their value
// e.g. $SOME_VAR
dollarvar 'sigil variable'
    = ws '$' name:ATOM+ ws { return {
        type: 'var',
        var: name
      }}

// any and all unqouted strings including command names
// must follow the variable declaration rule
atom 'unquoted string'
    = ws string:ATOM+ ws { return string.join('') }

// a normal double quote string
// unlike singe quotes it must support escape sequences
// TODO: support inlining variables
// NOTE: inlining vars could be done by simple regex replace
//       in the interpreter
quote_string 'string'
    = ws quotation_mark string:char* quotation_mark ws { return string.join('') }

// single quote, no escapes will work
single_quote_string 'single quote string'
    = ws single_quote string:unescapedS* single_quote ws { return string.join('') }

// parse

// top level START tokens
// all of these are valid lines in the lang
line
    = assign / pipe / comment / noop

// a command or command pipeline
pipe
    = cmd:command "|" next:pipe { return {
        type: 'pipe',
        pipe: cmd,
        to: next
      }}
    / command

command
    = cmd:atom args:( var )*  redir_io:( redirect )* { return {
        type: 'cmd',
        cmd: cmd,
        args: args,
        redirects: redir_io
      }}

// variable assignment
assign
    = assign:atom "=" value:var { return {
        type: 'assign',
        assign: assign,
        value: value
      }}
