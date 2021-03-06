###
   Copyright 2012 Peter Neumark

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   dtview.coffee - Presentation-related functions and classes.

###

define ['corelib'], (corelib) ->
    (dt) ->
        # Display the "loading..." message until fulfillment of promise
        corelib.Promise::toHTML = ->
            # TODO: touch up loading msg:
            div = $ '<div class="eval_result"><img src="img/ajax-loader.gif" /><span>loading...<span></div>'
            @afterSuccess (val) =>  
                div.children().remove()
                dt.pkgGet('ui','display').value val, false, div
            @afterFailure (val) =>  
                div.children().remove()
                dt.pkgGet('ui','display').value val, false, div
                # TODO: display 'show details' link to objectviewer output of error
            div

        dt.pkgGet('fs','lib').value.Node::toHTML = -> 
            $ "<div>#{ @name }</div>"

        dt.pkgGet('fs','lib').value.NodeSet::toHTML = -> 
            tbody = (@map (key, value) -> "<tr><td>#{ key }</td></tr>").join("")
            $ "<table>#{ tbody }</table>"
