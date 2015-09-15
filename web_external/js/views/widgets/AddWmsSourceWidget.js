'use strict';
/**
* This widget displays a form for adding WMS services
*/
minerva.views.AddWmsSourceWidget = minerva.View.extend({

    events: {
        'submit #m-add-wms-source-form': function (e) {
            e.preventDefault();
            var params = {
                name:     this.$('#m-wms-name').val(),
                baseURL:  this.$('#m-wms-uri').val(),
                username: this.$('#m-wms-username').val(),
                password: this.$('#m-wms-password').val()
            };
            var wmsSource = new minerva.models.WmsSourceModel({});
            wmsSource.on('m:sourceReceived', function () {
                this.$el.modal('hide');
                // TODO: might need to be added to a new panel/data sources ?
                this.collection.add(wmsSource);
            }, this).createSource(params);
        }
    },

    initialize: function (settings) {
        this.collection = settings.parentView.collection;
    },

    render: function () {
        var modal = this.$el.html(minerva.templates.addWmsSourceWidget({}));
        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        return this;
    }

});
