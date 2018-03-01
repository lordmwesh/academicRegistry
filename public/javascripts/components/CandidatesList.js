const candidatesListTemplate = `
<div class="panel panel-default" id="candidatesList">
    <div class="panel-heading">
        <h4>Candidates</h4>
    </div>
    <div class="panel-body">
        <table class="table table-sm table-hover table-striped">
            <thead>
                <tr>
                    <th>Admission Number</th>
                    <th>Name</th>
                    <th>Fees Paid</th>
                    <th>Passed Units</th>
                    <th>Admission Date</th>
                    <th>Cleared?</th>
                    <th>Units</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="candidate in candidates">
                    <td>{{candidate.admissionNumber}}</td>
                    <td>{{candidate.name}}</td>
                    <td>{{candidate.totalFeesPaid}}</td>
                    <td>{{candidate.passedUnits}}</td>
                    <td>{{candidate.admissionDate|toDate}}</td>
                    <td>{{candidate.clearedByAdmin}}</td>
                    <td>
                        <b-btn size="sm" variant="primary" @click="openCandidateUnitsModal(candidate)">
                            <i class="fa fa-pencil"></i> Manage
                        </b-btn>
                    </td>
                </tr>
                <tr v-if="candidates.length == 0">
                    <td colspan="7">
                        {{empty_message}}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Manage candidate units -->
        <b-modal v-model="showUnitsModal" title="Candidate Units" v-if="active_candidate">
            <h5>{{active_candidate.admissionNumber}} ({{active_candidate.name}}) Units</h5>
            <ul class="nav nav-tabs" id="unitsTab" role="tablist">
                <li class="nav-item" v-for="tab_item in units_tabs">
                    <a class="nav-link" :class="{'active': unit_active_tab == tab_item}" :id="tab_item+'-tab'" data-toggle="tab" @click="activateUnitsTab(tab_item)" role="tab" :ariaControls="tab_item" aria-selected="true">{{tab_item}}</a>
                </li>
            </ul>

            <div class="tab-content" id="unitsTabContent">
                <div v-for="tab_item in units_tabs" class="tab-pane fade" :class="{'show active': unit_active_tab == tab_item}" :id="tab_item" role="tabpanel" :ariaLabelledby="tab_item+'-tab'">
                    <div class="my-2">
                        <candidate-unit-list :candidate="active_candidate" v-if="unit_active_tab == 'List'"></candidate-unit-list>
                        <candidate-select-units :candidate="active_candidate" v-if="unit_active_tab == 'Select'"></candidate-select-units>
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
Vue.component('candidates-list', {
    template: candidatesListTemplate,
    data () {
        return {
            candidates: [],
            empty_message: 'Loading records ..',
            // Manage units modal
            showUnitsModal: false,
            active_candidate: null,
            units_tabs: ['List', 'Select'],
            unit_active_tab: 'List'
        }
    },
    created: function() {
        this.getCandidates();
    },
    filters: {
        toDate: function (timestamp) {
            try {
                return moment(timestamp, 'x').format('MMM Do, YYYY');
            } catch (ex) {
                console.log('Date error', ex);
            }
        }
    },
    methods: {
        getCandidates: function() {
            var self = this;
            App.showProcessing();
            axios.get('api/get-candidates')
              .then(function (response) {
                console.log(response);
                self.candidates = response.data.detail;
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
        openCandidateUnitsModal: function(candidate) {
            this.active_candidate = candidate;
            this.showUnitsModal = true;
        },
        activateUnitsTab: function(tab) {
            this.unit_active_tab = tab;
        }
    }
});