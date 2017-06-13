minerva.views.WmsFeatureInfoWidget = minerva.View.extend({

    callInfo: function (event) {
        var that = this;

        function getActiveWmsLayers() {
            return _.chain(that.parentView.collection.models)
                .filter(function (set) { return set.get('displayed') && set.get('visible') && set.getDatasetType() !== 'geojson' && set.getDatasetType() !== 'geojson-timeseries'; })
                .map(function (dataset) { return dataset.get('_id'); })
                .value();
        }

        /**
         * Filter out properties used for styling the geojson
         */
        function filterStyleProperties(props) {
            var styleProps = _.keys(minerva.models.GeoJSONStyle.prototype.defaults);
            props = _.extend({}, props);
            _.each(styleProps, function (s) {
                delete props[s];
            });
            return props;
        }

        function getActiveGeojsonLayers() {
            var geojsonLayers = [];
            _.chain(that.parentView.collection.models)
                .filter(function (set) { return set.get('displayed') && set.get('visible') && (set.getDatasetType() === 'geojson' || set.getDatasetType() === 'geojson-timeseries'); })
                .map(function (dataset) {
                    var i;
                    var name = dataset.get('name');
                    var features = dataset.geoJsLayer.features();
                    _.chain(features)
                        .filter(function (feature) { return feature.visible(); })
                        .each(function (feature) {
                            var hits = feature.pointSearch(event.geo);
                            if (hits && hits.found) {
                                for (i = hits.found.length - 1; i >= 0; i -= 1) {
                                    if (hits.found[i].properties) {
                                        geojsonLayers.push({
                                            properties: filterStyleProperties(hits.found[i].properties),
                                            id: name
                                        });
                                    }
                                }
                            }
                        });
                    return geojsonLayers;
                });

            return geojsonLayers;
        }

        function getInspectMapParams(event) {
            var mapParams = {};
            var coord = event.geo;
            var pnt = that.map.gcsToDisplay(coord);

            // Spherical Mercator projection.
            var mapBounds = that.map.bounds(undefined, 'EPSG:3857');

            if (mapBounds.left > mapBounds.right) {
                // 20037508.34 is the maximum extent of the Spherical Mercator projection.
                mapBounds.right = 20037508.34 + (20037508.34 - mapBounds.right);
            }
            mapParams['x'] = Math.round(pnt.x);
            mapParams['y'] = Math.round(pnt.y);
            mapParams['bbox'] = mapBounds.left + ',' + mapBounds.bottom + ',' + mapBounds.right + ',' + mapBounds.top;
            mapParams['width'] = that.map.node().width();
            mapParams['height'] = that.map.node().height();
            return mapParams;
        }

        var activeWmsLayers = getActiveWmsLayers();
        var mapParams = getInspectMapParams(event);

        if (activeWmsLayers.length > 0) {
            girder.restRequest({
                path: '/minerva_get_feature_info',
                type: 'GET',
                data: {
                    'activeLayers': activeWmsLayers,
                    'bbox': mapParams.bbox,
                    'x': mapParams.x,
                    'y': mapParams.y,
                    'width': mapParams.width,
                    'height': mapParams.height
                }
            }).done(function (data) {
                var obj = JSON.parse(data);
                var activeGeojsonLayers = getActiveGeojsonLayers();
                var inspectResp = obj.features.concat(activeGeojsonLayers);
                that.renderContents(inspectResp);
            });
        } else {
            var activeGeojsonLayers = getActiveGeojsonLayers();
            that.renderContents(activeGeojsonLayers);
        }
    },

    initialize: function (settings) {
        this.modal = {};
        this.map = settings.map;
        this.version = settings.version;
        this.layers = settings.layers;
        this.callback = settings.callback;
        this.el = $('#m-map-panel');
        this.content = '';
        this.fixedParams = 'REQUEST=GetFeatureInfo&' +
            'EXCEPTIONS=application%2Fvnd.ogc.se_xml&' +
            'SERVICE=WMS&FEATURE_COUNT=50&styles=&' +
            'srs=EPSG:3857&INFO_FORMAT=application/json&format=image%2Fpng';
    },

    renderContents: function (inspectResp) {
        if (inspectResp.length !== 0) {
            $('#m-wms-info-dialog').html(
                minerva.templates.wmsFeatureInfoContent({
                    layersInfo: inspectResp
                })
            );
            $('#m-wms-info-dialog').dialog('open');
        }
    },

    render: function () {
        this.$el.append(minerva.templates.wmsFeatureInfoWidget());
    }
});
