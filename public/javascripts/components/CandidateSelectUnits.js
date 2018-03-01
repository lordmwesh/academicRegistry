const candidateSelecteUnitsTemplate = `
<div class="panel panel-default" id="candidateSelectUnits">
    <div class="panel-heading">
        <h4>Select Units</h4>
    </div>
    <div class="panel-body" v-if="candidate_program">
        <p>Select units the candidate should be enrolled to, for {{candidate_program.name}} program </p>
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Take Unit (Register Unit)?</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="unit in program_units">
                    <td>{{unit.code}}</td>
                    <td>{{unit.name}}</td>
                    <td>
                        <input type="checkbox" v-model="unit.selected" @click="selectUnit(unit.code)"> 
                    </td>
                </tr>
                <tr v-if="program_units.length == 0">
                    <td colspan="3">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>`;
Vue.component('candidate-select-units', {
    template: candidateSelecteUnitsTemplate,
    props: ['candidate'],
    data () {
        return {
            candidate_program: null,
            program_units: [],
            empty_message: 'Loading records ..'
        }
    },
    created: function() {
        this.getCandidateProgram();
    },
    watch: {
        candidate_program: function(newVal, oldVal) {
            if (newVal) {
                this.getProgramUnits(newVal.code);
            }
        }
    },
    methods: {
        getCandidateProgram: function() {
            var self = this;
            var payload = {admissionNumber: this.candidate.admissionNumber};
            App.showProcessing();
            axios.post('api/get-candidate-program', payload)
              .then(function (response) {
                console.log(response);
                self.candidate_program = response.data.detail;
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
              });
            
        },
        getProgramUnits: function(program_code) {
            var self = this;
            App.showProcessing();
            axios.post('api/get-program-units', {program: program_code})
              .then(function (response) {
                console.log(response);
                self.program_units = response.data.detail;
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
              });
        },
        selectUnit: function(unit_code) {
            var self = this;
            const payload = {
                admissionNumber: this.candidate.admissionNumber,
                unitCode: unit_code,
                user: store.state.user
            }
            App.showProcessing();
            axios.post('api/register-candidate-unit', payload)
              .then(function (response) {
                App.notify('Candidate subscribed to unit', 'success');
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