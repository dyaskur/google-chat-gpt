import BaseCard from './BaseCard'
import {chat_v1 as chatV1} from '@googleapis/chat'
import {Configuration} from '../types/card'
import * as commands from '../json/models_by_command_id.json'
import {AbangModel} from '../types/model'
const commandsTyped = commands as {[key: string]: object}

export default class ConfigDialogCard extends BaseCard {
  private readonly config: Configuration

  constructor(config: Configuration) {
    super()
    this.config = config
  }

  create(): chatV1.Schema$GoogleAppsCardV1Card {
    this.buildHeader()
    this.buildSections()
    return this.card
  }

  buildHeader() {
    this.card.header = {
      title: 'Configuration',
      subtitle: 'Please set',
      imageType: 'CIRCLE',
    }
  }

  buildModelDropdown() {
    const items = (Object.entries(commandsTyped) as [string, AbangModel][]).map(([key, model]) => ({
      text: `${model.name} (${model.abangPricing.completion} coin per chat)`,
      value: key,
      selected: this.config.defaultModel === key,
    }))

    return {
      selectionInput: {
        type: 'DROPDOWN',
        label: 'Default Model',
        name: 'defaultModel',
        items,
      },
    }
  }

  buildSections() {
    this.card.sections = [
      {
        widgets: [
          this.buildModelDropdown(),
          {
            decoratedText: {
              topLabel: '',
              text: 'Show coin info every generated chat',
              bottomLabel: 'coin consumption and remaining info',
              switchControl: {
                controlType: 'SWITCH',
                name: 'show_coin_info',
                value: '1',
                selected: this.config.showCreditInfo ?? false,
                onChangeAction: {
                  function: 'new_poll_on_change',
                  parameters: [],
                },
              },
            },
          },
          {
            textParagraph: {
              text:
                'If you have any problems, questions, or feedback, ' +
                'please feel free to post them <a href="https://github.com/dyaskur/google-chat-poll/issues">here</a> ',
            },
          },
        ],
      },
    ]
  }
}
