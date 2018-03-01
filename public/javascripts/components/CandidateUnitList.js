const candidateUnitListTemplate = `
<div class="panel panel-default" id="candidateUnitsList">
    <div class="panel-heading">
        <h4>Candidate Units</h4>
    </div>
    <div class="panel-body">
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Passed? (Mark unit)</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="unit in candidate_units">
                    <td>{{unit.code}}</td>
                    <td>{{unit.name}}</td>
                    <td>
                        <input type="checkbox" value="true" v-model="unit.passed" @click="markUnit($event, unit)"> 
                    </td>
                </tr>
                <tr v-if="candidate_units.length == 0">
                    <td colspan="2">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>`;
Vue.component('candidate-unit-list', {
    template: candidateUnitListTemplate,
    props: ['candidate'],
    data () {
        return {
            candidate_units: [],
            empty_message: 'Loading records ..'
        }
    },
    created: function() {
        this.getCandidateUnits();
    },
    methods: {
        getCandidateUnits: function() {
            var self = this;
            var payload = {admissionNumber: this.candidate.admissionNumber};
            App.showProcessing();
            axios.post('api/get-candidate-units', payload)
              .then(function (response) {
                console.log(response);
                self.candidate_units = response.data.detail;
                App.hideProcessing();
                self.empty_message = 'No record found';
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
                self.empty_message = 'Problem experienced while loading records';
              });
        },
        markUnit: function ($event, unit) {
            if ($event.target.checked) {
                unit.passed = $event.target.value;
            } else {
                unit.passed = false;
            }
            var self = this;
            const payload = {
                admissionNumber: this.candidate.admissionNumber,
                unitCode: unit.code,
                passed: unit.passed,
                user: store.state.user
            }
            App.showProcessing();
            axios.post('api/mark-unit', payload)
              .then(function (response) {
                App.notify('Candidate unit marking status updated', 'success');
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