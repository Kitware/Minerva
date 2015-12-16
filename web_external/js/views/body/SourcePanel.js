minerva.views.SourcePanel = minerva.views.Panel.extend({

    events: {
        'click .m-add-source': 'addSourceDialog',
        'click .m-display-wms-layers-list': 'displayWmsLayersList',
        'click .m-icon-info': 'displaySourceInfo',
        'click .m-delete-source': 'deleteSource',
        'click .m-display-elasticsearch-query': 'displayElasticsearchQuery',
        'click .m-display-s3-bucket-hierarchy': 'selectS3Files',
        'click .m-display-mongo-collections': 'displayMongoCollections'
    },

    addSourceDialog: function () {
        var container = $('#g-dialog-container');

        this.addSourceWidget = new minerva.views.AddSourceWidget({
            el: container,
            collection: this.sourceCollection,
            parentView: this
        }).render();
    },

    selectS3Files: function (evt) {
        var el = $(evt.currentTarget);
        var source = this.sourceCollection.get(el.attr('cid'));

        this.datasetHierarchyWidget = new minerva.views.DatasetHierarchyWidget({
            el: $('#g-dialog-container'),
            dataset: source,
            folderId: source.metadata().folder_id,
            parentView: this
        });

    },

    displayMongoCollections: function (evt) {
        var el = $(evt.currentTarget);
        var source = this.sourceCollection.get(el.attr('cid'));
        if (!this.addMongoDatasetWidget) {
            this.addMongoDatasetWidget = new minerva.views.AddMongoDatasetWidget({
                el: $('#g-dialog-container'),
                source: source,
                collection: this.datasetCollection,
                folderId: source.getMinervaMetadata().folder_id,
                parentView: this
            });
            this.addMongoDatasetWidget.render();
        } else {
            this.addMongoDatasetWidget.setCurrentSource(source);
        }
    },

    displayWmsLayersList: function (evt) {
        // TODO this looks like a good interface for a generalized source-action
        // Then we could just have a single source-action event handler
        // which would pull the source type from the set of classes
        // then create and dispatch to the correct widget type.
        // First we should add in S3 as a source and get that working, then
        // refactor.
        var el = $(evt.currentTarget);
        var wmsSource = this.sourceCollection.get(el.attr('cid'));
        if (!this.wmsLayersListWidget) {
            this.wmsLayersListWidget = new minerva.views.WmsLayersListWidget({
                el: $('#g-dialog-container'),
                source: wmsSource,
                collection: this.datasetCollection,
                parentView: this
            });
        } else {
            this.wmsLayersListWidget.setCurrentSource(wmsSource);
        }
        this.wmsLayersListWidget.render();
    },

    displaySourceInfo: function (evt) {
        var el = $(evt.currentTarget);
        var source = this.sourceCollection.get(el.attr('cid'));
        this.sourceInfoWidget = new minerva.views.SourceInfoWidget({
            el: $('#g-dialog-container'),
            source: source,
            parentView: this
        });
        this.sourceInfoWidget.render();
    },

    deleteSource: function (evt) {
        var el = $(evt.currentTarget);
        var source = this.sourceCollection.get(el.attr('cid'));
        this.sourceCollection.remove(source);
        source.destroy();
    },

    displayElasticsearchQuery: function (evt) {
        var el = $(evt.currentTarget);
        var source = this.sourceCollection.get(el.attr('cid'));
        if (!this.elasticsearchWidget) {
            this.elasticsearchWidget = new minerva.views.ElasticsearchWidget({
                el: $('#g-dialog-container'),
                source: source,
                collection: this.datasetCollection,
                parentView: this
            });
        }
        this.elasticsearchWidget.render();
    },

    initialize: function (settings) {
        _.extend(this.events, minerva.views.Panel.prototype.events);
        this.session = settings.session.model;
        this.sourceCollection = settings.session.sourceCollection;
        this.datasetCollection = settings.session.datasetsCollection;

        // TODO similar to addSourceWidget,
        // would be nice if new source types could register themselves,
        // perhaps with a method on the minerva object, that we could then
        // query here.  All the source types register themselves upon definition,
        // and we query here upon instantation.
        this.sourceTypes = {
            wms: {
                icon: 'icon-layers',
                action: 'm-display-wms-layers-list'
            },
            elasticsearch: {
                icon: 'icon-search',
                action: 'm-display-elasticsearch-query'
            },
            s3: {
                icon: 'icon-cloud',
                action: 'm-display-s3-bucket-hierarchy'
            },
            mongo: {
                icon: 'icon-leaf',
                action: 'm-display-mongo-collections'
            }
        };

        this.listenTo(this.sourceCollection, 'g:changed', function () {
            this.render();
        }, this).listenTo(this.sourceCollection, 'change', function () {
            this.render();
        }, this).listenTo(this.sourceCollection, 'change:displayed', function () {
            this.render();
        }, this).listenTo(this.sourceCollection, 'add', function () {
            this.render();
        }, this).listenTo(this.sourceCollection, 'remove', function () {
            this.render();
        }, this);

        girder.eventStream.on('g:event.job_status', _.bind(function (event) {
            var status = window.parseInt(event.data.status);
            if (status === girder.jobs_JobStatus.SUCCESS &&
                event.data.type === 's3.import') {
                this.sourceCollection.fetch({}, true);
            }
        }, this));
    },

    render: function () {
        this.$el.html(minerva.templates.sourcePanel({
            sources: this.sourceCollection.models,
            sourceTypes: this.sourceTypes
        }));

        var tooltipProperties = {
            placement: 'left',
            delay: 400,
            container: this.$el,
            trigger: 'hover'
        };
        this.$('.m-add-source').tooltip(tooltipProperties);

        return this;
    }
});
