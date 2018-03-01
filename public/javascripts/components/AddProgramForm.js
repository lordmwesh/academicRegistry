const addProgramFormTemplate = `
<div class="panel panel-default">
    <div class="panel-heading">
        <h4>Add Course/Program</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="addProgramForm" @submit="saveForm(addProgramForm, event)">
            <div class="row">
                <div class="col-12 my-1">
                    <label class="control-label">Name</label>
                    <input type="text" class="form-control" v-model="program.name">
                </div>
            </div>
            <div class="row">
                <div class="col-6 my-1">
                    <label class="control-label">Minimum required units</label>
                    <input type="number" class="form-control" v-model="program.requiredMiniumUnits">
                    <div class="help-block text-info">
                        <small>The number units a candidate must pass.</small>
                    </div>
                </div>
                <div class="col-6 my-1">
                    <label class="control-label">Duration</label>
                    <input type="number" class="form-control" v-model="program.requiredMinimumDuration">
                </div>
            </div>
            <div class="row">
                <div class="col-6 my-1">
                    <label class="control-label">Total cost</label>
                    <input type="text" class="form-control" v-model="program.totalCost">
                </div>
            </div>
            <div class="row">
                <div class="col-12 my-1">
                    <button class="btn btn-success" type="submit">
                        <i class="fa fa-check"></i> Save
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>`;
Vue.component('add-program-form', {
    template: addProgramFormTemplate,
    data () {
        return {
            program: {
                name: null,
                requiredMiniumUnits: 0,
                requiredMinimumDuration: 0,
                totalCost: 0
            }
        }
    },
    created: function() {
        
    },
    methods: {
        saveForm: function(addProgramForm, event) {
            event.preventDefault();
            App.showProcessing({target: '#programsContainer'});
            var payload = this.program;
            payload.user = store.state.user;
            
            axios.post('api/add-program', payload)
              .then(function (response) {
                console.log(response);
                App.notify(response.data.detail, response.data.status);
                App.hideProcessing('#programsContainer');
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing('#programsContainer');
              });
        }
    }
});