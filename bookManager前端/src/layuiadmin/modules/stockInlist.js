layui.define(['index', 'table', 'laydate'], function (exports) {
    var admin = layui.admin,
        table = layui.table,
        $ = layui.$,
        form = layui.form,
        laydate = layui.laydate,
        setter = layui.setter;

    layer.ready(function () {
        $.ajax({
            url: setter.baseURL + 'getAllDBookName',
            type: 'post',
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Access-Control-Allow-Origin': '*'
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                var data = res.data;
                for(i = 0; i < data.length; i++) {
                    $("#bookName").append(new Option(data[i].name, data[i].name));
                }
                form.render();
            }
        });
        $.ajax({
            url: setter.baseURL + 'getAllDSupplierName',
            type: 'post',
            headers: {
                'Authorization': sessionStorage.getItem("token"),
                'Access-Control-Allow-Origin': '*'
            },
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            success: function(res) {
                var data = res.data;
                for(i = 0; i < data.length; i++) {
                    $("#supplier").append(new Option(data[i].name, data[i].name));
                }
                form.render();
            }
        })
    });

    laydate.render({
        elem: '#stockInDate' //指定元素
    });

    table.render({
        elem: '#test-table-toolbar',
        url: setter.baseURL + 'getStockInList',
        headers: {
            'Authorization': sessionStorage.getItem("token"),
            'Access-Control-Allow-Origin': '*'
        },
        toolbar: '#test-table-toolbar-toolbarDemo',
        where: {
            stockInDate: '',
            bookName: '',
            author: '',
            price: '',
            publisher: '',
            publishTime: '',
            bookSum: '',
            supplier: '',
            departmentName: '',
            supplierTel: ''
        },
        title: '教材入库表',
        cols: [
            [{
                type: 'checkbox',
                fixed: 'left'
            }, {
                field: 'stockInDate',
                title: '入库日期'
            }, {
                field: 'bookName',
                title: '教材名'
            }, {
                field: 'price',
                title: '单价(元)'
            }, {
                field: 'bookSum',
                title: '数量'
            }, {
                field: 'priceSum',
                title: '总价(元)'
            }, {
                field: 'supplier',
                title: '供应商'
            }, {
                field: 'departmentName',
                title: '经办单位'
            }, {
                title: '操作',
                fixed: 'right',
                align: 'center',
                toolbar: '#test-table-toolbar-barDemo',
                width: 150
            }]
        ],
        page: true,
        groups: 5,
        limit: 30,
        height: 'full-180',
        text: {
            none: '无结果'
        }
    });

    //监听行工具事件
    table.on('tool(test-table-toolbar)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('确认删除', function (index) {

                $.ajax({
                    url: setter.baseURL + 'deleteOneStockInById',
                    type: 'post',
                    headers: {
                        'Authorization': sessionStorage.getItem("token"),
                        'Access-Control-Allow-Origin': '*'
                    },
                    data: JSON.stringify(data),
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json',
                    success: function (res) {
                        layer.msg(res.msg, {
                            offset: '15px',
                            icon: 1,
                            time: 1000
                        }, function () {
                            obj.del();
                            layer.close(index);
                        });
                    }
                });
            });
        }
        if (obj.event === 'edit') {
            var tr = $(obj.tr);
            var id = obj.data.id;
            layer.open({
                type: 2,
                title: '编辑教材入库信息',
                content: 'stockInform.html',
                maxmin: true,
                area: ['500px', '450px'],
                btn: ['确定', '取消'],
                success: function (layero, index) {
                    let body = layer.getChildFrame('body', index);
                    body.find("#stockInDate").val(data.stockInDate);
                    body.find("#bookName").val(data.bookName);
                    body.find("#author").val(data.author);
                    body.find("#price").val(data.price);
                    body.find("#bookPrice").val(data.bookPrice);
                    body.find("#publishTime").val(data.publishTime);
                    body.find("#publisher").val(data.publisher);
                    body.find("#bookSum").val(data.bookSum);
                    body.find("#supplier").val(data.supplier);
                    body.find("#supplierTel").val(data.supplierTel);
                    body.find("#departmentName").val(data.departmentName);
                },
                yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-stockIn-front-submit',
                        submit = layero.find('iframe').contents().find('#' +
                            submitID);

                    //监听提交
                    iframeWindow.layui.form.on('submit(' + submitID + ')',
                        function (data) {

                            var field = data.field;
                            field['id'] = id;

                            //提交 Ajax 成功后，静态更新表格中的数据
                            $.ajax({
                                url: setter.baseURL + "updateStockIn",
                                type: 'post',
                                headers: {
                                    'Authorization': sessionStorage
                                        .getItem("token"),
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                data: JSON.stringify(field),
                                contentType: 'application/json;charset=utf-8',
                                dataType: 'json',
                                success: function (res) {
                                    layer.msg("修改成功！", {
                                        offset: '15px',
                                        icon: 1,
                                        time: 1000
                                    })
                                }
                            });
                            table.reload('test-table-toolbar'); //数据刷新
                            layer.close(index); //关闭弹层
                        });

                    submit.trigger('click');
                }
            });
        }
    });

    //监听搜索
    form.on('submit(LAY-stockIn-front-search)', function (data) {
        var field = data.field;

        //执行重载
        table.reload('test-table-toolbar', {
            where: field
        });
    });

    var active = {
        batchdel: function () {
            var checkStatus = table.checkStatus('test-table-toolbar'),
                checkData = checkStatus.data; //得到选中的数据

            if (checkData.length === 0) {
                return layer.msg('请选择数据');
            }

            layer.confirm('确定删除', function (index) {

                //执行 Ajax 后重载
                $.ajax({
                    url: setter.baseURL + 'deleteStockIns',
                    type: 'post',
                    data: JSON.stringify(checkData),
                    headers: {
                        'Authorization': sessionStorage.getItem("token"),
                        'Access-Control-Allow-Origin': '*'
                    },
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json',
                    success: function (res) {
                        table.reload('test-table-toolbar');
                        layer.msg('已删除');
                    },
                    error: function (res) {
                        layer.msg("删除失败")
                        table.reload('test-table-toolbar');
                    }
                })
            });
        },
        add: function () {
            layer.open({
                type: 2,
                title: '添加入库订单',
                content: 'stockInform.html',
                maxmin: true,
                area: ['500px', '450px'],
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-stockIn-front-submit',
                        submit = layero.find('iframe').contents().find('#' +
                            submitID);

                    //监听提交
                    iframeWindow.layui.form.on('submit(' + submitID + ')',
                        function (data) {
                            var field = data.field; //获取提交的字段

                            $.ajax({
                                url: setter.baseURL + "addStockIn",
                                type: 'post',
                                headers: {
                                    'Authorization': sessionStorage
                                        .getItem("token"),
                                    'Access-Control-Allow-Origin': '*'
                                },
                                data: JSON.stringify(field),
                                contentType: 'application/json;charset=utf-8',
                                dataType: 'json',
                                success: function (res) {
                                    layer.msg("添加成功");
                                    table.reload(
                                        'test-table-toolbar'
                                    ); //数据刷新
                                    layer.close(index); //关闭弹层
                                },
                                error: function (res) {
                                    layer.msg("添加失败");
                                    // table.reload('book-manage'); //数据刷新
                                    // layer.close(index); //关闭弹层
                                }
                            })

                        });

                    submit.trigger('click');
                }
            });
        }
    };
    $('.layui-btn.layuiadmin-btn-stockInlist').on('click', function () {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    exports('stockInlist', {})
});