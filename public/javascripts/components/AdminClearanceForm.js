const adminClearanceFormTemplate = `
<div class="panel panel-default">
    <div class="panel-heading">
        <h4>Clear Candidate</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="adminClearanceForm" @submit="saveForm(adminClearanceForm, event)">
            <div class="row">
                <div class="col-6">
                    <label class="control-label">Candidate</label>
                    <select class="form-control" v-model="candidate">
                        <option value=''>Select candidate</option>
                        <option v-for="cand in candidates" :value="cand.admissionNumber">{{cand.admissionNumber}} ({{cand.name}})</option>
                    </select>
                    <div class="help-block text-info">
                        <small>Select the candidate you would like to clear</small>
                    </div>
                </div>
            </div>
            <div class="checkbox">
                <label>
                    <input type="checkbox" v-model="cleared" value="true"> Mark as cleared
                </label>
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
Vue.component('admin-clearance-form', {
    template: adminClearanceFormTemplate,
    data () {
      return {
        cleared: false,
        candidate: '',
        candidates: []
      }
    },
    created: function () {
        this.getCandidates();
    },
    methods: {
        getCandidates() {
            var self = this;
              App.showProcessing();
              axios.get('api/get-candidates', {})
                .then(function (response) {
                  console.log(response);
                  self.candidates = response.data.detail;
                  App.hideProcessing();
                })
                .catch(function (error) {
                  const err = error.response.data;
                  App.hideProcessing();
                  App.notify(err.detail, 'danger');
                });
        },
        saveForm: function(adminClearanceForm, event) {
            event.preventDefault();
            const payload = {
                cleared: this.cleared,
                admissionNumber: this.candidate,
                user: store.state.user
            }
            App.showProcessing();
            axios.post('api/clear-candidate', payload)
              .then(function (response) {
                console.log(response);
                App.notify(response.data.detail, response.data.status);
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
              });
        }
    }
});