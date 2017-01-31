loading_dashboard = false;

$(document).ready(function(){
    init();
});


function init() {
    var options = {
        height:20,
    };
    $('.grid-stack').gridstack(options);
    this.grid = $('.grid-stack').data('gridstack');
    $('.grid-stack').on('change', layout_change);
    update_dashboard_list();
    load_dashboard('default')
}


function layout_change(event, panels) {
    if(!loading_dashboard){
        save_dashboard(panels)
    }
}


function save_dashboard(panels){
    panels = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
        el = $(el);
        var node = el.data('_gridstack_node');
        var title_node = $(el.find('.panel-heading')[0])[0]
        title = title_node.innerText
        return {
            title: title,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
        };
    }, this);
    title_node = $("#dashboard-title")[0]
    dashboard_title = title_node.innerText
    dashboard_slug = $(title_node).attr("data-slug")
    url = "/ajax/dashboard/"+dashboard_slug

    data = {
        panels: panels,
        title: dashboard_title,
        slug: dashboard_slug
    }
    data = JSON.stringify(data, null, '    ');

    $.ajax({
      type: "POST",
      url: url,
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    });
};


function update_dashboard_list() {
    dashboards_list = $("#dashboards_list")
    dashboards_list.empty()

    $.getJSON( "/ajax/dashboards", function( data ) {
        $.each( data, function( key, val ) {
            $anchor = $("<a>"+val+"</a>");
            $item = $("<li></li>");
            $item.append($anchor);
            dashboards_list.append($item);
            $item.click(function(){load_dashboard(val)});
        });
    });
};


function load_dashboard(slug){
    $.ajax({
        type: "GET",
        url: "/ajax/dashboard/"+slug,
        success: function( data ) {
            loading_dashboard = true;

            this.grid = $('.grid-stack').data('gridstack');
            this.grid.removeAll();
            $dashboard = JSON.parse(data)

            // Load Title/Slug
            $('#dashboard-title')[0].innerText = $dashboard.title
            $($('#dashboard-title')[0]).attr("data-slug", $dashboard.slug)

            // Load Panels
            $panels = $dashboard.panels
            $.each($panels, function(key, panel ) {
                add_panel(panel.title, panel.content, panel.x, panel.y, panel.width, panel.height)
            })

            loading_dashboard = false;
        }
    })
}


function add_panel(title, content, x, y, w, h){
    panel = $(`
    <div>
        <div class="grid-stack-item-content panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">`+title+`</h3>
            </div>
            <div class="panel-body">`+content+`</div>
        </div>
    </div>`);

    this.grid.addWidget(panel, x, y, w, h);
}