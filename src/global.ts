import {Store} from 'vuex/types';
import {computed} from 'vue';
import {computedGetter, getAction, getMutation, getStoreFromInstance, useMapping, ExtractGetterTypes, ExtractTypes, KnownKeys, RefTypes, TMap} from './util';

function computedState(store: any, prop: string) {
	return computed(() => store.state[prop]);
}

// useState<{val: string;}>(storeOrMap: Store<{val: string;}> | "val"[], map?: "val"[]): RefTypes<{ val: string;}>
// "val" 不是常量吗

// ("age" | "val")[])  表示数组里面的值要么是val 要么是age
// KnownKeys  获取key类型
export function useState<TState extends Object = any>(storeOrMap: Store<TState> | TMap<KnownKeys<TState>>[], map?: TMap<KnownKeys<TState>>[]): RefTypes<TState> {
	let store = storeOrMap;

	if (arguments.length === 1) {
		map = store as TMap<KnownKeys<TState>>[];
		store = getStoreFromInstance();
	}
	return useMapping(store, null, map, computedState); 
}

export function useGetters<TGetters extends Object = any>(storeOrMap: Store<any> | TMap<KnownKeys<TGetters>>[], map?: TMap<KnownKeys<TGetters>>[]): ExtractGetterTypes<TGetters> {
	let store = storeOrMap;
	if (arguments.length === 1) {
		map = store as TMap<KnownKeys<TGetters>>[];
		store = getStoreFromInstance();
	}
	return useMapping(store, null, map, computedGetter);
}

// useMutations(store, ['change'])
// 
export function useMutations<TMutations extends Object = any>(storeOrMap: Store<any> | TMap<KnownKeys<TMutations>>[], map?: KnownKeys<TMutations>[]): ExtractTypes<TMutations, Function> {
	let store = storeOrMap;

	if (arguments.length === 1) {
		map = store as TMap<KnownKeys<TMutations>>[];
		store = getStoreFromInstance();
	}
	return useMapping(store, null, map, getMutation);
}

export function useActions<TActions extends Object = any>(storeOrMap: Store<any> | TMap<KnownKeys<TActions>>[], map?: KnownKeys<TActions>[]): ExtractTypes<TActions, Function> {
	let store = storeOrMap;

	if (arguments.length === 1) {
		map = store as TMap<KnownKeys<TActions>>[];
		store = getStoreFromInstance();
	}
	return useMapping(store, null, map, getAction);
}

// 我们怎么知道state类型，得让用户传给我们