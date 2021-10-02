import {computed} from 'vue';
import {computedGetter, getAction, getMutation, getStoreFromInstance, useMapping, KnownKeys, RefTypes, ExtractTypes, ExtractGetterTypes, TMap} from './util';
import {Store} from 'vuex';

export type Nullish = null | undefined;

function computedState(store: any, namespace: string, prop: string) {
	// 解决在命名空间深度嵌套
	let module = namespace.split('/').reduce((module, key) => module[key], store.state)
	console.log('namespace--->',namespace)
	console.log('module--->',module)
	return computed(() => module[prop])
}

export function useNamespacedState<TState extends Object = any>(storeOrNamespace: Store<any> | string  | Nullish, namespaceOrMap: string | TMap<KnownKeys<TState>>[], map?:TMap<KnownKeys<TState>>[]): RefTypes<TState> {
	let store: Store<any>, namespace: string;

	if (arguments.length === 2) {
		store = getStoreFromInstance();
		map = namespaceOrMap as TMap<KnownKeys<TState>>[];
		namespace = storeOrNamespace as string;
	} else {
		store = storeOrNamespace as Store<TState> || getStoreFromInstance();
		namespace = namespaceOrMap as string;
	}
	return useMapping(store, namespace, map, computedState);
}

export function useNamespacedMutations<TMutations extends Object = {}>(storeOrNamespace: Store<any> | string | Nullish, namespaceOrMap: string | TMap<KnownKeys<TMutations>>[], map?:TMap<KnownKeys<TMutations>>[]): ExtractTypes<TMutations, Function> {
	let store: Store<any>, namespace: string;

	if (arguments.length === 2) {
		store = getStoreFromInstance();
		map = namespaceOrMap as TMap<KnownKeys<TMutations>>[];
		namespace = storeOrNamespace as string;
	} else {
		store = storeOrNamespace as Store<any> || getStoreFromInstance();
		namespace = namespaceOrMap as string;
	}
	return useMapping(store, namespace, map, getMutation);
}

export function useNamespacedActions<TActions extends Object = {}>(storeOrNamespace: Store<any> | string | Nullish, namespaceOrMap: string | TMap<KnownKeys<TActions>>[], map?: TMap<KnownKeys<TActions>>[]): ExtractTypes<TActions, Function> {
	let store: Store<any>, namespace: string;

	if (arguments.length === 2) {
		store = getStoreFromInstance();
		map = namespaceOrMap as  TMap<KnownKeys<TActions>>[];
		namespace = storeOrNamespace as string;
	} else {
		store = storeOrNamespace as Store<any> || getStoreFromInstance();
		namespace = namespaceOrMap as string;
	}
	return useMapping(store, namespace, map, getAction);
}

export function useNamespacedGetters<TGetters extends Object = {}>(storeOrNamespace: Store<any> | string | Nullish, namespaceOrMap: string |  TMap<KnownKeys<TGetters>>[], map?: TMap<KnownKeys<TGetters>>[]): ExtractGetterTypes<TGetters> {
	let store: Store<any>, namespace: string;

	if (arguments.length === 2) {
		store = getStoreFromInstance();
		map = namespaceOrMap as TMap<KnownKeys<TGetters>>[];
		namespace = storeOrNamespace as string;
	} else {
		store = storeOrNamespace as Store<any> || getStoreFromInstance();
		namespace = namespaceOrMap as string;
	}
	return useMapping(store, namespace, map, computedGetter);
}

// 不能默认给{} 因为any可以适配{age:number} 但是{} 适配不了
export function createNamespacedHelpers<TState extends Object = any, TGetters extends Object = any, TMutations extends Object = any,TActions extends Object = any>(storeOrNamespace: Store<any> | string, namespace?: string):{
	useState: (map?: TMap<KnownKeys<TState>>[]) => RefTypes<TState>;
	useGetters: (map?: TMap<KnownKeys<TGetters>>[]) => ExtractGetterTypes<TGetters>;
	useMutations: (map?: TMap<KnownKeys<TMutations>>[]) => ExtractTypes<TMutations, Function>;
	useActions: (map?: TMap<KnownKeys<TActions>>[]) => ExtractTypes<TActions, Function>;
} {
	let store: Store<any> | Nullish = undefined;
	if (arguments.length === 1) {
		namespace = storeOrNamespace as string;
	} else {
		store = storeOrNamespace as Store<any>;
		if (!namespace) {
			throw new Error('Namespace is missing to provide namespaced helpers')
		}
	}
	return {
		useState: (map?: TMap<KnownKeys<TState>>[]) => useNamespacedState(store, namespace as string, map),
		useGetters: (map?: TMap<KnownKeys<TGetters>>[]) => useNamespacedGetters(store, namespace as string, map),
		useMutations: (map?:TMap<KnownKeys<TMutations>>[]) => useNamespacedMutations(store, namespace as string, map),
		useActions: (map?: TMap<KnownKeys<TActions>>[]) => useNamespacedActions(store, namespace as string, map),
	}
}
