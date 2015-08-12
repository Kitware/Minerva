minerva.views.JobsPanel = minerva.View.extend({

    initialize: function () {
        this.jobListWidget = new girder.views.jobs_JobListWidget({
            showHeader: false,
            pageLimit: 10,
            parentView: this
        });
        var columns = this.jobListWidget.columnEnum.COLUMN_STATUS_ICON |
                      this.jobListWidget.columnEnum.COLUMN_TITLE;
        this.jobListWidget.columns = columns;
    },

    render: function () {
        this.$el.html(minerva.templates.jobsPanel({}));
        this.jobListWidget.setElement(this.$('.m-jobsListContainer'));

        return this;
    }
});
