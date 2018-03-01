const enrollCandidateFormTemplate = `
<div class="panel panel-default">
    <div class="panel-heading">
        <h4>Enroll/New Candidate</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="enrollCandidateForm" @submit="saveForm(enrollCandidateForm, event)">
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="control-label">Name</label>
                        <input type="text" class="form-control" v-model="candidate.name">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label class="control-label">National ID Number</label>
                        <input type="text" class="form-control" v-model="candidate.idNumber">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label class="control-label">Program/Course</label>
                        <select v-model="candidate.programCode" class="form-control">
                            <option selected value="">Select program</option>
                            <option v-for="program in programs" :key="program.code" :value="program.code">{{program.name}}</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label class="control-label">Admission date</label>
                        <input type="date" class="form-control" v-model="candidate.admissionDate">
                    </div>
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
Vue.component('enroll-student-form', {
    template: enrollCandidateFormTemplate,
    data () {
      return {
          candidate: {
              admissionNumber: null,
              name: null,
              admissionDate: null,
              programCode: null,
              totalFeesPaid: 0,
              passedUnits: 0,
              totalUnits: 0,
              clearedByAdmin: false,
              idNumber: null
            },
            programs: []
        }
    },
    created: function() {
        this.getPrograms()
    },
    methods: {
        saveForm: function(enrollCandidateForm, event) {
            event.preventDefault();
            App.showProcessing();
            var payload = this.candidate;
            payload.user = store.state.user;

            axios.post('api/enroll-candidate', payload)
              .then(function (response) {
                console.log(response);
                App.hideProcessing();
                App.notify(response.data.detail, response.data.status);
              })
              .catch(function (error) {
                const err = error.response.data;
                App.hideProcessing();
                App.notify(err.detail, 'danger');
              });
        },
        getPrograms: function () {
            var self = this;
            App.showProcessing();
            axios.get('api/get-programs', {})
            .then(function (response) {
                console.log(response);
                self.programs = response.data.detail;
                App.hideProcessing();
            })
            .catch(function (error) {
                const err = error.response.data;
                App.hideProcessing();
                App.notify(err.detail, 'danger');
            });
        }
    }
});