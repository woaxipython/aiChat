import { ref, watch } from 'vue'
import type { Friend } from '../types'
import { saveFriends, loadFriends } from '../utils/friends'

export function useFriends() {
  // 状态管理
  const friendsList = ref<Friend[]>([])
  const selectedFriendId = ref<number | null>(null)

  // 加载与保存
  function loadFriendsList() {
    friendsList.value = loadFriends()
  }

  // 自动保存变更
  watch(friendsList, (newList) => {
    saveFriends(newList)
  }, { deep: true })

  // 好友名称处理
  function generateUniqueName(baseName: string): string {
    const existingNames = friendsList.value.map(friend => friend.name)
    let newName = baseName
    let counter = 1

    while (existingNames.includes(newName)) {
      newName = `${baseName}-${counter}`
      counter++
    }

    return newName
  }

  // 好友排序处理
  function reorderFriend(friend: Friend) {
    const currentIndex = friendsList.value.findIndex(f => f.id === friend.id)
    if (currentIndex === -1) return
    
    friendsList.value.splice(currentIndex, 1)
    
    const insertIndex = friend.isPinned ? 0 : 
      friendsList.value.findLastIndex(f => f.isPinned) + 1
    friendsList.value.splice(insertIndex, 0, friend)
  }

  // 好友操作方法
  const friendActions = {
    add(friendName: string) {
      const newFriend: Friend = {
        id: Date.now(),
        name: generateUniqueName(friendName),
        description: '这是一个新的好友',
        isPinned: false,
        apiId: 'default-api',
        modelName: 'default-model'
      }
      
      friendsList.value.push(newFriend)
    },

    select(friend: Friend) {
      if (selectedFriendId.value === friend.id) {
        selectedFriendId.value = null
        return
      }
      
      selectedFriendId.value = friend.id
      reorderFriend(friend)
    },

    delete(id: number) {
      friendsList.value = friendsList.value.filter(friend => friend.id !== id)
      if (selectedFriendId.value === id) {
        selectedFriendId.value = null
      }
    },

    togglePin(id: number) {
      const friend = friendsList.value.find(friend => friend.id === id)
      if (!friend) return
      
      friend.isPinned = !friend.isPinned
      reorderFriend(friend)
    },

    update(id: number, updates: Partial<Friend>) {
      const index = friendsList.value.findIndex(friend => friend.id === id)
      if (index === -1) return

      friendsList.value[index] = {
        ...friendsList.value[index],
        ...updates
      }
    }
  }

  return {
    // 状态
    friendsList,
    selectedFriendId,

    // 初始化
    loadFriendsList,

    // 操作方法
    addFriend: friendActions.add,
    handleFriendClick: friendActions.select,
    deleteFriend: friendActions.delete,
    pinFriend: friendActions.togglePin,
    updateFriend: friendActions.update
  }
} 