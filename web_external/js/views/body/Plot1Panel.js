minerva.views.Plot1Panel = minerva.View.extend({

    events: {
    },

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(minerva.templates.plot1Panel());
    }
});
