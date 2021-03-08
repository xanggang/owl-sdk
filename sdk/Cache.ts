
class Cache {
  errorMap: any = {}

  checkCache (data: any) {
    const type = data.type

    if (type === 'error') {
      const errorMessage = data?.exception?.values?.[0]?.value
      if (this.errorMap[errorMessage]) {
        return false
      } else {
        this.errorMap[errorMessage] = true
        return true
      }
    }
    if (type === 'api') {
      const url = data.url
      if (this.errorMap[url]) {
        return false
      } else {
        this.errorMap[url] = true
        return true
      }
    }

    return true
  }
}

export default new Cache()
