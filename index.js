/*
 * Copyright (C) 2016  prussian <genunrest@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var SHELL_VARS = {}

var readline = require('readline'),
    parser = require('./parse/line').parse,
    builtins = require('./lib/core-builtins'),
    pipeline = require('./lib/pipeline')(builtins, SHELL_VARS)

var templ = (line) => `(function() {
    with(this)
    return \`${line}\`
}).bind(SHELL_VARS)()`

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

var linebuffer = ''
rl.on('line', line => {
    if (line.slice(-1) == '\\') {
        linebuffer += line.slice(0, -2)
        return
    }
    linebuffer += line
    linebuffer = eval(templ(linebuffer))
    
    try {
        linebuffer = parser(linebuffer)
    }
    catch (e) {
        console.log(e)
        linebuffer = ''
        return
    }

    var pipe = pipeline(linebuffer, null, builtins, SHELL_VARS)
    if (pipe) pipe.pipe(process.stdout)
    linebuffer = ''
})
