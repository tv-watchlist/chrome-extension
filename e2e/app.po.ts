import { browser, by, element } from 'protractor';

export class ChromeExtensionPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('tvq-root h1')).getText();
  }
}
