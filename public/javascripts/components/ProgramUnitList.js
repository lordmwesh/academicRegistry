const programUnitListTemplate = `
<div class="panel panel-default" id="programUnitsList">
    <div class="panel-heading">
        <h4>Program Units</h4>
    </div>
    <div class="panel-body">
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="unit in units">
                    <td>{{unit.code}}</td>
                    <td>{{unit.name}}</td>
                </tr>
                <tr v-if="units.length == 0">
                    <td colspan="2">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>`;
Vue.component('program-unit-list', {
    template: programUnitListTemplate,
    props: ['program'],
    data () {
        return {
            units: [],
            empty_message: 'Loading records ..'
        }
    },
    created: function() {
        this.getProgramUnits();
    },
    methods: {
        getProgramUnits: function() {
            var self = this;
            App.showProcessing();
            axios.post('api/get-program-units', {program: this.program})
              .then(function (response) {
                console.log(response);
                self.units = response.data.detail;
                self.empty_message = 'No record found';
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
                self.empty_message = 'Problem experienced while loading records';
              });
        }
    }
});