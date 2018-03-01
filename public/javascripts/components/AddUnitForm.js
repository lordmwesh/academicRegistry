const addUnitFormTemplate = `
<div class="panel panel-default">
    <div class="panel-heading">
        <h4>Add Unit</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="addUnitForm" @submit="saveForm(addUnitForm, event)">
            <div class="form-group">
                <label class="control-label">Name</label>
                <input type="text" class="form-control" v-model="unit.name">
            </div>
            <div class="row">
                <div class="col-12">
                    <button class="btn btn-success" type="submit">
                        <i class="fa fa-check"></i> Save
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>`;
Vue.component('add-unit-form', {
    template: addUnitFormTemplate,
    props: ['program'],
    data () {
        return {
            unit: {
                name: null
            }
        }
    },
    created: function() {
        
    },
    methods: {
        saveForm: function(addUnitForm, event) {
            event.preventDefault();
            var payload = this.unit;
            payload.user = store.state.user;
            payload.program = this.program;
            
            axios.post('api/add-unit', payload)
              .then(function (response) {
                console.log(response);
                App.notify(response.data.detail, response.data.status);
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
              });
        }
    }
});