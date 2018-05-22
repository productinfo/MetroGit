import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { JiraIntegrationService } from '../services/jira-integration.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Issue } from '../models/issue';

@Component({
  selector: 'app-key-selector',
  templateUrl: './key-selector.component.html',
  styleUrls: ['./key-selector.component.scss']
})
export class KeySelectorComponent implements OnInit {

  @Input() set currentIssueKey(key: string) {
    this._key = key;
    this.queryKey = key;
  }
  @Output() currentIssueKeyChange = new EventEmitter<string>();
  @Output() issueSelected = new EventEmitter<Issue>();
  get currentIssueKey() {
    return this._key;
  }
  private _key = "";
  private editing = false;
  private queryKey = "";
  private toggled = false;
  private loading = false;
  private issues = [];
  constructor(
    private jira: JiraIntegrationService,
    private sanitizer: DomSanitizer,

  ) {
    jira.issueQueryRetrieved.subscribe(issues => {
      this.loading = false;
      issues.map(issue => {
        issue.fields.priority.safeIconUrl = this.sanitizer.bypassSecurityTrustUrl(issue.fields.priority.iconUrl);
        issue.fields.issuetype.safeIconUrl = this.sanitizer.bypassSecurityTrustResourceUrl(issue.fields.issuetype.iconUrl);
      });
      this.issues = issues;
      if (this.issues) {
        this.toggled = true;
      } else {
        this.toggled = false;
      }
    });
  }

  ngOnInit() {
  }

  enableEditing() {
    this.queryKey = this._key;
    this.editing = true;
  }
  cancelEdit($event) {
    this.editing = false;
    $event.stopPropagation();
  }
  onKeyChanged() {
    this.loading = true;
    this.jira.searchIssues(this.queryKey, ['summary', 'priority', 'issuetype']);
  }
  selectIssue(key, $event) {
    this.editing = false;
    this.issueSelected.emit(key);
    $event.stopPropagation();
  }
}
