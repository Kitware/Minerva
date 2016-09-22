/*
  This widget displays a styling modal for WMS layers.
*/

minerva.views.StyleWmsDatasetWidget = minerva.View.extend({

    events: {
        'submit #m-wms-multiband-style-form': function (e) {
            e.preventDefault();
            var params = {
                subType: this._get_geospatial_type(),
                _id: this.dataset.id,
                typeName: this.dataset.get('meta').minerva.type_name,
                redChannel: this.$('#m-red-channel').val(),
                greenChannel: this.$('#m-green-channel').val(),
                blueChannel: this.$('#m-blue-channel').val()
            };

            girder.restRequest({
                path: '/minerva_style_wms',
                type: 'POST',
                data: params,
                error: null
            }).then(_.bind(function () {
                this.$el.modal('hide');
                this.dataset.fetch();
            }, this));
        },
        'submit #m-wms-singleband-style-form': function (e) {
            e.preventDefault();
            var params = {
                subType: this._get_geospatial_type(),
                _id: this.dataset.id,
                typeName: this.dataset.get('meta').minerva.type_name,
                min: this.$('#m-min-value').val(),
                max: this.$('#m-max-value').val(),
                ramp: this.ramps[this.$('#m-color-ramp').val()].value,
                ramp_name: this.$('#m-color-ramp').val()
            };

            girder.restRequest({
                path: '/minerva_style_wms',
                type: 'POST',
                data: params,
                error: null
            }).then(_.bind(function () {
                this.$el.modal('hide');
                this.dataset.fetch();
            }, this));
        },
        'submit #m-wms-style-form': function (e) {
            e.preventDefault();
            var attribute = this.$('#m-attribute').val();
            var dataMeta = this.dataset.get('meta').minerva.layer_info.attributes;
            var params = {
                subType: this._get_geospatial_type(),
                _id: this.dataset.id,
                typeName: this.dataset.get('meta').minerva.type_name,
                attribute: attribute,
                min: dataMeta[attribute].properties.min,
                max: dataMeta[attribute].properties.max,
                count: dataMeta[attribute].properties.count,
                ramp: this.ramps[this.$('#m-color-ramp').val()].value,
                ramp_name: this.$('#m-color-ramp').val()
            };

            girder.restRequest({
                path: '/minerva_style_wms',
                type: 'POST',
                data: params,
                error: null
            }).then(_.bind(function () {
                this.$el.modal('hide');
                this.dataset.fetch();
            }, this));
        }

    },

    initialize: function (settings) {
        this.dataset = settings.dataset;
    },

    _get_geospatial_type: function () {
        var subType = this.dataset.get('meta').minerva.layer_info.subType;
        return subType;
    },

    _get_bands: function () {
        var bands = this.dataset.get('meta').minerva.layer_info.bands;
        return bands;
    },

    ramps: _.map(colorbrewer, _.bind(function (ramp, name) {
        var n = "<ul class='m-color-ramp'>";
        _.each(ramp[6], function (color, i) {
            n += "<li style='background-color: " + color + "'/>";
        });
        n += '</ul>';
        this[name] = {
            value: ramp[6],
            display: n
        };
        return this;
    }, {}))[0],

    _get_attributes: function () {
        var attributes = this.dataset.get('meta').minerva.layer_info.attributes;
        var num_attr = _.map(attributes, function (value, key) {
            if (value.properties) {
                return key;
            }
        });

        return num_attr.filter(Boolean);
    },

    _get_template: function (subType) {
        subType = this._get_geospatial_type();
        if (subType === 'multiband') {
            var bands = this._get_bands();
            return minerva.templates.styleMultiBandRasterWidget({
                bands: bands
            });
        } else if (subType === 'singleband') {
            var band = this._get_bands();
            var name = _.keys(band)[0];
            var minimum = band[name].properties.min;
            var maximum = band[name].properties.max;
            return minerva.templates.styleSingleBandRasterWidget({
                name: name,
                min: minimum,
                max: maximum,
                ramps: this.ramps
            });
        } else {
            var attributes = this._get_attributes();
            return minerva.templates.styleWmsDatasetWidget({
                attributes: attributes,
                ramps: this.ramps
            });
        }
    },

    render: function () {
        var subType = this._get_geospatial_type();
        var template = this._get_template(subType);
        var modal = this.$el.html(template).girderModal(this);
        this.$('select.m-select-ramp').selectpicker({width: '100%'});

        // Make the forms remember
        if (this.dataset.get('meta').minerva.sld_params) {
            var sldMeta = this.dataset.get('meta').minerva.sld_params;
            if (subType === 'multiband') {
                this.$('#m-red-channel').val(sldMeta.redChannel);
                this.$('#m-green-channel').val(sldMeta.greenChannel);
                this.$('#m-blue-channel').val(sldMeta.blueChannel);
            } else if (subType === 'singleband') {
                this.$('#m-min-value').val(sldMeta.min);
                this.$('#m-max-value').val(sldMeta.max);
                this.$('#m-color-ramp').selectpicker('val', sldMeta.ramp_name);
            } else {
                this.$('#m-color-ramp').selectpicker('val', sldMeta.ramp_name);
                this.$('#m-attribute').val(sldMeta.attribute);
            }
        }
        modal.trigger($.Event('ready.girder.modal', {relatedTarget: modal}));
        return this;
    }
});
