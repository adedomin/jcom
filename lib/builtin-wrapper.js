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

var stream = require('stream-wrapper'),
    bindex = require('buffer-indexof')

module.exports = function(builtin, args, opts) {

    // stateful information between buffered lines
    this.persist = {}
    this.builtin = builtin.func.bind(this.persist, opts.vars, args)

    this.bufferAt = builtin.buffer
    this.buffer = ''
    this.inputStream = null
    this.stdout = stream.readable()
    this.outcb = (err, out, more) => {
        this.stdout.push(out) 
        if (!more && !this.stdout._readableState.ended) {
            this.stdout.push(null)
        }
    }

    this.instream = stream.writable((chunk, enc, cb) => {
        if (!this.bufferAt) {
            this.buffer += chunk.toString()
            cb()
            return
        }

        var bindx = bindex(chunk, this.bufferAt)
        if (bindx > -1) {
            this.buffer += chunk.slice(bindx + 1).toString(enc)
            this.builtin(this.buffer, this.outcb)
            this.buffer = ''
        }
        else
            this.buffer += chunk.toString()

        cb()
    })

    this.instream.on('finish', () => {
        this.builtin(this.buffer, this.outcb)
    })

    if (opts && opts.stdio) {
        this.inputStream = opts.stdio[0]
    }

    if (this.inputStream) this.inputStream.pipe(this.instream)
    else this.builtin(null, this.outcb)
}
