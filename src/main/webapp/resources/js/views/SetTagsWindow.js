// *****************************************************************************
//
// Copyright (c) 2015, Southwest Research Institute® (SwRI®)
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of Southwest Research Institute® (SwRI®) nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL Southwest Research Institute® BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
// DAMAGE.
//
// *****************************************************************************

// The data store containing the list of options
var places = Ext.create('Ext.data.Store', {
    fields: ['name'],
    data : [
        {"name":"Aachen City"},
        {"name":"Aachen Outskirts"},
        {"name":"Parking Place 1"},
        {"name":"Testing Track 1"},
        {"name":"Testing Track 2"},
        {"name":"Other"}
    ]
});

var modes = Ext.create('Ext.data.Store', {
    fields: ['name'],
    data : [
        {"name":"Open Loop"},
        {"name":"Closed Loop"},
        {"name":"Simulation"},
        {"name":"Other"}
    ]
});

Ext.define('BagDatabase.views.SetTagsWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.setTagsWindow',
    title: 'Set Tags',
    layout: 'fit',
    defaultFocus: '#placeField',
    constrainHeader: true,
    items: [{
            url: 'bags/setTagsForBag',
            xtype: 'form',
            layout: 'anchor',
            referenceHolder: true,
            defaultButton: 'submitButton',
            itemId: 'setTagsForm',
            defaults: {
                margin: 10,
                labelWidth: 60,
                anchor: '100%'
            },
            items: [{
                       xtype: 'combobox',
                       fieldLabel: 'Place',
                       name: 'placeValue',
                       itemId: 'placeField',
                       emptyText: 'Select Place',
                       allowBlank: true,
                       padding: 10,
                       store: places,
                       queryMode: 'local',
//                       enableRegEx: true,   if you want exact match
                       anyMatch:true,
                       validateOnBlur: true,
                       validator: function(val){
                           var valid_input = false;
                           if(places.findRecord("name",val) || val == ""){
                               valid_input = true;
                           } else {
                               valid_input = "Please select from the drop down values only."
                           }
                           return valid_input;
                       },
                       displayField: 'name'
                   },{
                       xtype: 'combobox',
                       fieldLabel: 'Mode',
                       name: 'modeValue',
                       itemId: 'modeField',
                       emptyText: 'Select Mode',
                       padding: 10,
                       store: modes,
                       queryMode: 'local',
                       anyMatch:true,
                       allowBlank: true,
                       validateOnBlur: true,
                       validator: function(val){
                           var valid_input = false;
                           if(modes.findRecord("name",val) || val == ""){
                               valid_input = true;
                           } else {
                               valid_input = "Please select from the drop down values only."
                           }
                           return valid_input;
                       },
                       displayField: 'name'
                   },{
                       xtype: 'textarea',
                       padding: 10,
                       name: 'othersValue',
                       itemId: 'othersField',
                       emptyText: 'Any Other Information',
                       fieldLabel: 'Others'
                   },{
                        xtype: 'hidden',
                        itemId: 'bagIdField',
                        name: 'bagId'
            }],
            buttons: [{
                text: 'Save',
                reference: 'submitButton',
                formBind: true,
                disabled: true,
                handler: function() {
                    var params = {};
                    params[csrfName] = csrfToken;
                    var tagWin = this.up('window');
                    this.up('form').getForm().submit({
                        params: params,
                        success: function(form, action) {
                            if (tagWin.tagGrid) {
                                tagWin.tagGrid.up('window').reloadTags();
                            }
                            if (tagWin.targetStores && tagWin.targetStores.forEach) {
                                tagWin.targetStores.forEach(function(store) {
                                    store.load();
                                });
                            }
                            tagWin.close();
                        },
                        failure: function(form, action) {
                            Ext.Msg.alert('Error', 'Error occurred setting tag.');
                        }
                    });
                }
            }]
        }],
        initComponent: function() {
            this.callParent(arguments);

            var bagId = this.bagIds;
            this.down('#bagIdField').setValue(bagId);
            var tagGrid = this.tagGrid;
            var tagsStore = tagGrid.getStore();
            var placeRecord = tagsStore.findRecord('tag','Place');
            var modeRecord = tagsStore.findRecord('tag','Mode');
            var othersRecord = tagsStore.findRecord('tag','Others');
            if(placeRecord){
                this.down('#placeField').setValue(placeRecord.getData().value);
            }
            if(modeRecord){
                this.down('#modeField').setValue(modeRecord.getData().value);
            }
            if(othersRecord){
                this.down('#othersField').setValue(othersRecord.getData().value);
            }
        }
});
