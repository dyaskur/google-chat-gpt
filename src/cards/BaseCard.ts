import {chat_v1 as chatV1} from '@googleapis/chat'

interface Card {
  buildHeader?(): void

  buildSections(): void

  buildButtons?(): void

  buildFooter?(): void

  create(): chatV1.Schema$GoogleAppsCardV1Card

  createCardWithId(): chatV1.Schema$CardWithId

  createMessage(): chatV1.Schema$Message
}

export default abstract class BaseCard implements Card {
  protected id: string = 'cardId'
  private _content: chatV1.Schema$GoogleAppsCardV1Section[] = []

  protected card: chatV1.Schema$GoogleAppsCardV1Card = {
    sections: this._content,
  }

  protected addSectionWidget(widget: chatV1.Schema$GoogleAppsCardV1Widget) {
    this.card.sections!.push({widgets: [widget]})
  }

  abstract buildSections(): void

  abstract create(): chatV1.Schema$GoogleAppsCardV1Card

  createCardWithId(): chatV1.Schema$CardWithId {
    return {
      cardId: this.id,
      card: this.create(),
    }
  }

  createMessage(): chatV1.Schema$Message {
    return {cardsV2: [this.createCardWithId()]}
  }
}
