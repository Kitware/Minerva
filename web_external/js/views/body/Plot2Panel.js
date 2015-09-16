minerva.views.Plot2Panel = minerva.View.extend({

    events: {
    },

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(minerva.templates.plot2Panel());

        return this;
    }
});
