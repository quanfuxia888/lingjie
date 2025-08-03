import {request} from "../../utils/request";
import {Character} from "../types/character";

class CharacterService {

  async getList(): Promise<Array<Character>> {
    return request.request({
      url: '/api/character/index'
    })
  }


  async setCharacter(sn: string, characterId: number) {
    return request.request({
      url: '/api/device/set-character',
      method: 'POST',
      data: {
        sn: sn,
        character_id: characterId
      }
    })
  }

  async create(data) {
    return request.request({
      url: '/api/character/create',
      method: 'POST',
      data: data
    })
  }

  async requestTask() {
    return request.request({
      url: '/api/user/getBrief',
      method: 'POST',
      enableChunked: true,
    })
  }

  async getInfo(data) {
    return request.request({
      url: '/api/character/getInfo?id=' + data,
      method: 'GET',
    })
  }

  async getDelete(data) {
    return request.request({
      url: '/api/character/delete?id=' + data,
      method: 'GET',
    })
  }

  async update(data,id) {
    return request.request({
      url: '/api/character/update?id=' + id,
      method: 'POST',
      data: data
    })
  }

  async dialogue(sn: string, characterId: number, page: number) {

    return request.request({
      url: '/api/character/dialogue',
      method: 'POST',
      data: {
        sn: sn,
        character_id: characterId,
        page: page
      }
    })
  }

  async getUserCharacters() {
    return request.request({
      url: '/api/user/characters',
      method: 'POST'
    })
  }

  async getVoiceList() {
    return request.request({
      url: '/api/character/voiceList',
      method: 'POST'
    })
  }

  async getMyCharacterList() {
    return request.request({
      url: '/api/character/index?creator_type=2',
      method: 'POST'
    })
  }

  async getGroupList() {
    return request.request({
      url: '/api/configGroup/getList',
      method: 'POST'
    })
  }

}

export default new CharacterService();