import { mergeConfigs } from './merge-config'
import { normalize } from './normalize-args'
import { useSWRConfig } from './use-swr-config'
import { BUILT_IN_MIDDLEWARE } from './middleware-preset'

// It's tricky to pass generic types as parameters, so we just directly override
// the types here.
// 设计思想--- 函数柯里化
export const withArgs = <SWRType>(hook: any) => {
  return function useSWRArgs(...args: any) {
    // Get the default and inherited configuration.
    const fallbackConfig = useSWRConfig()

    // Normalize arguments.
    const [key, fn, _config] = normalize<any, any>(args)

    // Merge configurations.
    const config = mergeConfigs(fallbackConfig, _config)

    // Apply middleware
    let next = hook //next 初始化为 传入的hook 函数 
    const { use } = config
    const middleware = (use || []).concat(BUILT_IN_MIDDLEWARE)
    
    // 倒序 包装 最先包装的
    for (let i = middleware.length; i--; ) {
      // 每个middleware 都接收一个 next函数
      // 返回一个新的函数
      next = middleware[i](next)
    }
    // 如果fetcher是全局配置的话 可以不传异步函数 
    // fn为null 则用config.fetcher 表示用的是全局提供的函数
    return next(key, fn || config.fetcher, config)
  } as unknown as SWRType
}
