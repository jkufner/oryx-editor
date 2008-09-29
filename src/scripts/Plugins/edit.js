/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.Edit = Clazz.extend({    facade: undefined,        construct: function(facade){            this.facade = facade;        this.copyElements = [];                this.facade.registerOnEvent('keydown', this.keyHandler.bind(this));                this.facade.offer({         name: ORYX.I18N.Edit.cut,         description: ORYX.I18N.Edit.cutDesc,         icon: ORYX.PATH + "images/cut.png",         functionality: this.editCut.bind(this),         group: ORYX.I18N.Edit.group,         index: 1,         minShape: 1         });                 this.facade.offer({         name: ORYX.I18N.Edit.copy,         description: ORYX.I18N.Edit.copyDesc,         icon: ORYX.PATH + "images/page_copy.png",         functionality: this.editCopy.bind(this),         group: ORYX.I18N.Edit.group,         index: 2,         minShape: 1         });                 this.facade.offer({         name: ORYX.I18N.Edit.paste,         description: ORYX.I18N.Edit.pasteDesc,         icon: ORYX.PATH + "images/page_paste.png",         functionality: this.editPaste.bind(this),         isEnabled: this.clipboardIsOccupied.bind(this),         group: ORYX.I18N.Edit.group,         index: 3,         minShape: 0,         maxShape: 0         });                 this.facade.offer({            name: ORYX.I18N.Edit.del,            description: ORYX.I18N.Edit.delDesc,            icon: ORYX.PATH + "images/cross.png",            functionality: this.editDelete.bind(this),            group: ORYX.I18N.Edit.group,            index: 4,            minShape: 1        });                         /* What is the purpose of this?!		 this.facade.offer({         name: "Show Clipboard",         description: "Show Clipboard.",         icon: ORYX.PATH + "images/box.png",         functionality: this.showClipboard.bind(this),         group: "Edit",         index: 5         });         */             },        /**     * Determines whether the clipboard currently is occupied.     */    clipboardIsOccupied: function(){        return this.copyElements.length > 0;    },        showClipboard: function(){            Ext.Msg.alert("Oryx", this.inspect(this.copyElements, true, 3));    },        inspect: function(toInspect, ignoreFunctions, depth){            if (depth-- <= 0)             return toInspect;                var temp = "";        for (key in toInspect) {                    var current = toInspect[key];                        if (ignoreFunctions && (current instanceof Function))                 continue;                        temp += key + ": (" + this.inspect(current, ignoreFunctions, depth) +            ") -";        }                if (temp == "")             return toInspect;        else             return temp;    },    	move: function(key, far) {		// calculate the distance to move the objects and get the selection.		var distance = far? 20 : 5;		var selection = this.facade.getSelection();		var p = {x: 0, y: 0};				// switch on the key pressed and populate the point to move by.		switch(key) {			case ORYX.CONFIG.KEY_CODE_LEFT:				p.x = -1*distance;				break;			case ORYX.CONFIG.KEY_CODE_RIGHT:				p.x = distance;				break;			case ORYX.CONFIG.KEY_CODE_UP:				p.y = -1*distance;				break;			case ORYX.CONFIG.KEY_CODE_DOWN:				p.y = distance;				break;		}				// move each shape in the selection by the point calculated and update it.		selection.findAll(function(shape){ 			// Check if this shape is docked to an shape in the selection						if(shape instanceof ORYX.Core.Node && selection.include(shape.getIncomingShapes()[0])){ 				//return false 			} 						// Check if any of the parent shape is included in the selection			var s = shape.parent; 			do{ 				if(selection.include(s)){ 					return false				}			}while(s = s.parent); 						// Otherwise, return true			return true;					}).each(function(shape) {									if (shape instanceof ORYX.Core.Edge) {				shape.dockers.each(function(docker){					if( !selection.member(docker.getDockedShape()) ){						docker.setDockedShape(undefined);						docker.bounds.moveBy(p);						docker.update();							}										})			} else {								shape.bounds.moveBy(p);				shape.update();									var childShapesNodes 	= shape.getChildShapes(true).findAll(function(shape){ return shape instanceof ORYX.Core.Node });				var childDockedShapes 	= childShapesNodes.collect(function(shape){ return shape.getAllDockedShapes() }).flatten().uniq();				var childDockedEdge		= childDockedShapes.findAll(function(shape){ return shape instanceof ORYX.Core.Edge  && !selection.include(shape)});				childDockedEdge			= childDockedEdge.findAll(function(shape){ return shape.getAllDockedShapes().all(function(dsh){ return childShapesNodes.include(dsh)}) });				var childDockedDockers	= childDockedEdge.collect(function(shape){ return shape.dockers }).flatten();								childDockedDockers.each(function(docker){					if( !docker.getDockedShape() && !selection.include(docker.parent)){						docker.bounds.moveBy(p);						docker.update();					}				}.bind(this));								}		});				// when done, the selection needs to be updated, too.		this.facade.updateSelection();				ORYX.Log.debug("Leaving move in edit.js.");	},	    /**     * The key handler for this plugin. Every action from the set of cut, copy,     * paste and delete should be accessible trough simple keyboard shortcuts.     * This method checks whether any event triggers one of those actions.     *     * @param {Object} event The keyboard event that should be analysed for     *     triggering of this plugin.     */    keyHandler: function(event){        //TODO document what event.which is.                ORYX.Log.debug("edit.js handles a keyEvent.");                // assure we have the current event.        if (!event)             event = window.event;                        // get the currently pressed key and state of control key.        var pressedKey = event.which || event.keyCode;        var ctrlPressed = event.ctrlKey;		// if the key is one of the arrow keys, forward to move and return.		if ([ORYX.CONFIG.KEY_CODE_LEFT, ORYX.CONFIG.KEY_CODE_RIGHT,			ORYX.CONFIG.KEY_CODE_UP, ORYX.CONFIG.KEY_CODE_DOWN].include(pressedKey)) {						this.move(pressedKey, !ctrlPressed);			return;		}                // if the object is to be deleted, do so, and return immediately.        if ((pressedKey == ORYX.CONFIG.KEY_CODE_DELETE) ||        ((pressedKey == ORYX.CONFIG.KEY_CODE_BACKSPACE) &&        (event.metaKey || event.appleMetaKey))) {                    ORYX.Log.debug("edit.js deletes the shape.");            this.editDelete();            return;        }                 // if control key is not pressed, we're not interested anymore.         if (!ctrlPressed)         return;                  // when ctrl is pressed, switch trough the possibilities.         switch (pressedKey) {         	         // cut.	         case ORYX.CONFIG.KEY_CODE_X:	         this.editCut();	         break;	         	         // copy.	         case ORYX.CONFIG.KEY_CODE_C:	         this.editCopy();	         break;	         	         // paste.	         case ORYX.CONFIG.KEY_CODE_V:	         this.editPaste();	         break;         }    },        /**     * Performs the cut operation by first copy-ing and then deleting the     * current selection.     */    editCut: function(){        //TODO document why this returns false.        //TODO document what the magic boolean parameters are supposed to do.                this.editCopy(false);        this.editDelete(true);        return false;    },        /**     * Performs the copy operation.     * @param {Object} will_not_update ??     */    editCopy: function( will_update ){        //TODO what should be the state of the clipboards, if it previously was        // X, nothing is selected, and that, is then copied. Currently,        // clipboard is empty afterwards.                this.copyElements = [];        		// Create all references for the serialized objects		DataManager.serializeDOM( this.facade );				var setRefPoint = function(dockerString, pos, xval, yval){			if( !dockerString ){ return "" }						var refPoint = dockerString.split(" ").without("").without("#").collect(function(el){return parseFloat(el)})			refPoint[pos*2] 	= xval;			refPoint[(pos*2)+1] = yval;						return refPoint.join(" ");		}								var selection = this.facade.getSelection()         selection.each((function(value){                    var serialize = value.serialize();           			if( value instanceof ORYX.Core.Edge ){				var fD = value.dockers.first();				var lD = value.dockers.last();								var dockers = serialize.find(function(v){ return v.name == "dockers"})								if( fD.getDockedShape() && selection.indexOf( fD.getDockedShape() ) < 0 ){					var absFD = fD.bounds.center();					dockers.value = setRefPoint(dockers.value, 0, absFD.x, absFD.y );				} else if( lD.getDockedShape() && selection.indexOf( lD.getDockedShape() ) < 0){					var absLD = lD.bounds.center();					dockers.value = setRefPoint(dockers.value, value.dockers.length-1, absLD.x, absLD.y );				}			}						this.copyElements.push(serialize);                    }).bind(this));        this.copyElements.each((function(value, index){        			value.each(function(el){								if(el.name == "outgoing" && el.prefix == "raziel" && el.value.length > 1){										var sh = selection.find(function(shape){ return shape.resourceId == el.value.slice(1)})					if( sh ){						value.push({							name:		'outgoing',							prefix:		'copy',							type:		'literal',							value:		selection.indexOf( sh )												})										}										el.value = "";				}								// Set the absolute bounds				if(el.name == "bounds" && el.prefix == "oryx" ){					var absBounds = selection[index].absoluteBounds();					el.value = "" + absBounds.a.x + "," + absBounds.a.y + "," + absBounds.b.x + "," + absBounds.b.y + "";				}						}.bind(this))                    }).bind(this));				                if( will_update ){            this.facade.updateSelection();					}    },        /**     * Performs the paste operation.     */    editPaste: function(){            var newElements = [];		// Reset the resource IDs		        this.copyElements.each((function(value){            // Create the new Shape            var newShape = this.facade.createShape({                serialize: value            });                        this.facade.getCanvas().add(newShape);                        newShape.bounds.moveBy(ORYX.CONFIG.EDIT_OFFSET_PASTE, ORYX.CONFIG.EDIT_OFFSET_PASTE);            			if( newShape instanceof ORYX.Core.Edge ){				newShape.dockers.each(function(docker){docker.bounds.moveBy(ORYX.CONFIG.EDIT_OFFSET_PASTE, ORYX.CONFIG.EDIT_OFFSET_PASTE);docker.update()})			}			            // Update            newShape.update();                        newElements.push(newShape);                    }).bind(this));						var getRefPoint = function(serial, pos){			if( !serial ){ return null }						var refPoint						if(serial.name == "docker"){				refPoint = serial.value.replace(/,/g, " ").split(" ").without("").collect(function(el){return parseFloat(el)})				refPoint = {x: refPoint[pos*2], y: refPoint[(pos*2)+1]}			} else if(serial.name == "dockers"){				refPoint = serial.value.split(" ").without("").without("#").collect(function(el){return parseFloat(el)})				refPoint = {x: refPoint[pos*2], y: refPoint[(pos*2)+1]}			}						return refPoint;		}										newElements.each(function(shape, index){						var outgoing = this.copyElements[index].find(function(el){return el.name == 'outgoing' && el.prefix == 'copy'});			outgoing = outgoing ? outgoing.value : -1;						if( outgoing >= 0 && outgoing < newElements.length){								var followingShape = newElements[outgoing];								if( followingShape.dockers.length > 0){					var refPoint = getRefPoint(this.copyElements[outgoing].find(function(el){return (el.name == 'docker' || el.name == 'dockers') && el.prefix == 'oryx'}), 0)					refPoint = refPoint ? refPoint : {x: shape.bounds.width() / 2.0, y: shape.bounds.height() / 2.0};															followingShape.dockers.first().setDockedShape( shape );					followingShape.dockers.first().setReferencePoint( refPoint );					followingShape.dockers.first().update()									} else if(  shape.dockers.length > 0 ){					var refPoint = getRefPoint(this.copyElements[index].find(function(el){return (el.name == 'docker' || el.name == 'dockers') && el.prefix == 'oryx'}), shape.dockers.length-1)					refPoint = refPoint ? refPoint : {x: followingShape.bounds.width() / 2.0, y: followingShape.bounds.height() / 2.0};					shape.dockers.last().setDockedShape( followingShape );					shape.dockers.last().setReferencePoint( refPoint );					shape.dockers.last().update()													}						}					}.bind(this))						                this.facade.setSelection(newElements);    },        /**     * Performs the delete operation. No more asking.     * @param {Object} will_not_ask ??     */    editDelete: function(will_not_ask){            var elements = this.facade.getSelection();                // we once asked for confirmation:        // var ask_remove = will_not_ask === true || confirm( "Do you really want to delete the selected shape" + ((elements.length == 1) ? "": "s") + "?");        // if(!ask_remove) return;        		var parents = [];		        elements.each((function(shape){			if(shape.parent && !(shape.parent instanceof ORYX.Core.Canvas))				parents.push(shape.parent);							this.facade.deleteShape(shape);        }).bind(this));		parents = parents.uniq();		parents.each(function(parent) {			parent.update();		});		        this.facade.setSelection([]);    }});