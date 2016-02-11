minerva.views.LayersPanel = minerva.views.Panel.extend({

    events: {
        'click .m-remove-dataset-from-layer': 'removeDatasetEvent',
        'change .m-opacity-range': 'changeLayerOpacity',
        'click .m-order-layer': 'reorderLayer'
    },

    removeDatasetEvent: function (event) {
        var datasetId = $(event.currentTarget).attr('m-dataset-id');
        var dataset = this.collection.get(datasetId);
        dataset.set('displayed', false);
    },

    changeLayerOpacity: function (event) {
        var datasetId = $(event.currentTarget).attr('m-dataset-id');
        var dataset = this.collection.get(datasetId);
        var opacity = event.target.value;
        dataset.set('opacity', parseFloat(opacity));
    },

    reorderDisplayedLayers: function (option, dataset) {
        // Re-set the layer order on the map and then set the new order
        if (dataset.get('order') === option) {
            dataset.set('order', null);
        }
        dataset.set('order', option);
    },

    reorderLayer: function (event) {
        var prevDataset, nextDataset;
        var datasetId = $(event.currentTarget).attr('m-dataset-id');
        var option = $(event.currentTarget).attr('m-order-option');
        var dataset = this.collection.get(datasetId);
        var displayedDatasets = _.filter(this.collection.models, function (set) {
            return set.get('displayed');
        });

        var currentDatasetIndex = _.indexOf(displayedDatasets, dataset);

        var numberOfPossibleLayers = this.collection.models.length;
        var numberOfLayersInSession = displayedDatasets.length;

        if (displayedDatasets[currentDatasetIndex - 1]) {
            prevDataset = displayedDatasets[currentDatasetIndex - 1];
        }

        if (displayedDatasets[currentDatasetIndex + 1]) {
            nextDataset = displayedDatasets[currentDatasetIndex + 1];
        }

        var stackValues = _.map(displayedDatasets, function (dataset) {
            return dataset.get('stack');
        });

        var currentStack = dataset.get('stack');
        // Retrieve the first and last stack value in the collection
        var lastValueInStack = _.last((stackValues).sort(function (a, b) {
            return a - b;
        }));
        var firstValueInStack = _.first((stackValues).sort(function (a, b) {
            return a - b;
        }));


        if (option === 'moveToTop' && currentStack !== lastValueInStack) {
            dataset.set('stack', lastValueInStack + 1);
            this.reorderDisplayedLayers(option, dataset);
        } else if (option === 'moveToBottom' && currentStack !== firstValueInStack) {
            dataset.set('stack', firstValueInStack - 1);
            this.reorderDisplayedLayers(option, dataset);
        } else if (option === 'moveUp' && currentStack !== lastValueInStack) {
            dataset.set('stack', currentStack + 1);
            (nextDataset || prevDataset).set('stack', currentStack);
            this.reorderDisplayedLayers(option, dataset);
        } else if (option === 'moveDown' && currentStack !== firstValueInStack ) {
            dataset.set('stack', currentStack - 1);
            (prevDataset || nextDataset).set('stack', currentStack);
            this.reorderDisplayedLayers(option, dataset);
        }
    },

    initialize: function (settings) {
        settings = settings || {};
        this.collection = settings.session.datasetsCollection;
        this.layersOrderOptions = [
            {'title': 'move up', 'method': 'moveUp', 'class': 'up'},
            {'title': 'move down', 'method': 'moveDown', 'class': 'down'},
            {'title': 'move to top', 'method': 'moveToTop', 'class': 'double-up'},
            {'title': 'move to bottom', 'method': 'moveToBottom', 'class': 'double-down'}
        ];

        this.listenTo(this.collection, 'change:displayed change:order', function () {
            this.render();
        }, this);
        this.listenTo(this.collection, 'change:geoError', function () {
            this.render();
        }, this);

        minerva.views.Panel.prototype.initialize.apply(this);
    },

    render: function () {
        var displayedDatasets = _.filter(this.collection.models, function (set) {
            return set.get('displayed');
        });

        // Sort datasets by stack
        var sortedDisplayedDatasets = _.sortBy(displayedDatasets, function (set) {
            return set.get('stack');
        }).reverse();

        this.$el.html(minerva.templates.layersPanel({
            datasets: sortedDisplayedDatasets,
            layersOrderOptions: this.layersOrderOptions
        }));

        return this;
    }
});
