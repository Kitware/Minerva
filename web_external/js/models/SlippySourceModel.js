minerva.models.SlippySourceModel = minerva.models.SourceModel.extend({

    createSource: function (params) {
        girder.restRequest({
            path: '/minerva_source_slippy',
            type: 'POST',
            data: params,
            error: null // ignore default error behavior (validation may fail)
        }).done(_.bind(function (resp) {
            this.set(resp);
            this.trigger('m:sourceReceived');
        }, this)).error(_.bind(function (err) {
            this.trigger('m:error', err);
        }, this));

        return this;
    }

});
