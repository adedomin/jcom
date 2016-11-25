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
    fs = require('fs')

var pipeline = (tree, outstream) => {

    console.log(tree)
    var opts = {}
    if (outstream) {
        opts.stdio = [ outstream, 'pipe', process.stderr ]
    }

    if (tree.type == 'cmd') {
        if (tree.redirects) {
            tree.redirects = tree.redirects.filter((redir) => redir.dir == '>').map((redir) => {
                return fs.createWriteStream(redir.file)
            })
            var cmd = spawn(tree.cmd, tree.args, opts)
            tree.redirects.map((redir) => {
                cmd.stdout.pipe(redir)
            })
            return cmd.stdout
        }
        return spawn(tree.cmd, tree.args, opts).stdout
    }
    
    return pipeline(tree.to, pipeline(tree.pipe, outstream))
}

module.exports = pipeline
