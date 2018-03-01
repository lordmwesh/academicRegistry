const updateFeesFormTemplate = `
<div class="panel panel-default">
    <div class="panel-heading">
        <h4>Update Fees</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="updateFeesForm" @submit="saveForm(updateFeesForm, event)">
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
            <div class="row">
                <div class="col-6 my-2">
                    <label class="control-label">Amount</label>
                    <input type="number" v-model="amount" class="form-control">
                </div>
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
Vue.component('update-fees-form', {
    template: updateFeesFormTemplate,
    data () {
      return {
        amount: 0,
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
        saveForm: function(updateFeesForm, event) {
            event.preventDefault();
            const payload = {
                amount: this.amount,
                admissionNumber: this.candidate,
                user: store.state.user
            }
            App.showProcessing();
            axios.post('api/update-fees', payload)
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