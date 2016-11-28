/*
 * Copyright (C) 2016  Anthony DeDominic <dedominica@my.easternct.edu>
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

var spawn = require('child_process').spawn,
    Builtin = require('./builtin-wrapper.js'),
    builtins, SHELL_VARS
//    fs = require('fs')

var pipeline = (tree, outstream) => {

    console.log(tree)
    if (!tree) return

    var opts = { vars: SHELL_VARS }
    if (outstream) {
        opts.stdio = [ outstream, 'pipe', process.stderr ]
    }

    if (tree.type == 'cmd') {
        if (builtins[tree.cmd]) {
            return new Builtin(builtins[tree.cmd], tree.args, opts).stdout
        }
        return spawn(tree.cmd, tree.args, opts).stdout
    }
    
    if (tree.type == 'pipe')
        var ret = pipeline(tree.to, pipeline(tree.pipe, outstream))
        console.log(ret)
        return ret
}

module.exports = (_builtins, _SHELL_VARS) => {
    builtins = _builtins
    SHELL_VARS = _SHELL_VARS
    return pipeline
}
