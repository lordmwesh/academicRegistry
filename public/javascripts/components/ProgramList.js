const programListTemplate = `
<div class="panel panel-default" id="programsList">
    <div class="panel-heading">
        <h4>Programs/Courses</h4>
    </div>
    <div class="panel-body">
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Min Required Units</th>
                    <th>Duration</th>
                    <th>Total Cost</th>
                    <th>Units</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="program in programs">
                    <td>{{program.code}}</td>
                    <td>{{program.name}}</td>
                    <td>{{program.requiredMiniumUnits}}</td>
                    <td>{{program.requiredMinimumDuration}}</td>
                    <td>{{program.totalCost}}</td>
                    <td>
                        <b-btn size="sm" variant="primary" @click="openProgramUnitsModal(program)">
                            <i class="fa fa-pencil"></i> Manage
                        </b-btn>
                    </td>
                </tr>
                <tr v-if="programs.length == 0">
                    <td colspan="6">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Manage program units -->
        <b-modal v-model="showUnitsModal" title="Program Units" v-if="active_program">
            <h5>{{active_program.name}} Units</h5>
            <ul class="nav nav-tabs" id="unitsTab" role="tablist">
                <li class="nav-item" v-for="tab_item in units_tabs">
                    <a class="nav-link" :class="{'active': unit_active_tab == tab_item}" :id="tab_item+'-tab'" data-toggle="tab" @click="activateUnitsTab(tab_item)" role="tab" :ariaControls="tab_item" aria-selected="true">{{tab_item}}</a>
                </li>
            </ul>

            <div class="tab-content" id="unitsTabContent">
                <div v-for="tab_item in units_tabs" class="tab-pane fade" :class="{'show active': unit_active_tab == tab_item}" :id="tab_item" role="tabpanel" :ariaLabelledby="tab_item+'-tab'">
                    <div class="my-2">
                        <program-unit-list :program="active_program.code" v-if="unit_active_tab == 'List'"></program-unit-list>
                        <add-unit-form :program="active_program.code" v-if="unit_active_tab == 'New'"></add-unit-form>
                    </div>
                </div>
            </div>
            <div slot="modal-footer" class="w-100">
                <b-btn size="sm" class="float-right" variant="default" @click="showUnitsModal=false">
                    Close
                </b-btn>
            </div>
        </b-modal>
    </div>
</div>`;
Vue.component('programs-list', {
    template: programListTemplate,
    data () {
        return {
            programs: [],
            empty_message: 'Loading records ..',
            // Manage units modal
            showUnitsModal: false,
            active_program: null,
            program_units: [],
            units_tabs: ['List', 'New'],
            unit_active_tab: 'List'
        }
    },
    created: function() {
        this.getPrograms();
    },
    methods: {
        getPrograms: function() {
            var self = this;
            App.showProcessing();
            axios.get('api/get-programs')
              .then(function (response) {
                console.log(response);
                self.programs = response.data.detail;
                self.empty_message = 'No record found';
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
                self.empty_message = 'Problem experienced while loading records';
              });
        },
        openProgramUnitsModal: function(program) {
            this.active_program = program;
            this.showUnitsModal = true;
        },
        activateUnitsTab: function(tab) {
            this.unit_active_tab = tab;
        }
    }
});