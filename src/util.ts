import {computed, getCurrentInstance, Ref} from 'vue';
import {Store} from 'vuex/types';

declare type OmitFirstArg<F, TReturn> =
	F extends (x: any, ...args: infer P) => any
		? (...args: P) => TReturn
		: never;

declare type InferType<T, TUnknown = any> =
	T extends (...args: any) => any
		? OmitFirstArg<T, ReturnType<T>>
		: T extends unknown
		? TUnknown
		: T;

declare type InferGetterType<T> =
	T extends (...args: any) => any
		? ReturnType<T>
		: any;

export declare type ExtractTypes<O, TUnknown = any> = {
	readonly [K in keyof O]: InferType<O[K], TUnknown>;
};

// 提取getter类型
export declare type ExtractGetterTypes<O> = {
	readonly [K in keyof O]: Ref<InferGetterType<O[K]>>;
};

// 这个types utils将 type: {a:number,b:string} ---> type: "a" | "b"
export declare type KnownKeys<T> = {
	[K in keyof T]: string extends K
		? (T extends any ? any : never)
		: number extends K
			? never
			: K
} extends {
		[_ in keyof T]: infer U
	}
	? U
	: never;

// 试试调用这个type util
// type A = ("a" | "b")[]
// type A =  KnownKeys<{a:number,b:string}>[]

export declare type RefTypes<T> = {
	readonly [Key in keyof T]: Ref<T[Key]>
}


// 调用callback
function runCB<T>(cb: Function, store: any, namespace: string | null, prop: KnownKeys<T> | string) {
	if (cb.length === 3) { // choose which signature to pass to cb function
		return cb(store, namespace, prop);
	} else {
		return cb(store, namespace ? `${namespace}/${prop}` : prop);
	}
}

function useFromArray(store: any, namespace: string | null, props: Array<string>, cb: Function) {
	return props.reduce((result, prop) => {
		result[prop] = runCB(cb, store, namespace, prop)
		// 这个结果还是类似这样
		// 
		return result;
	}, {} as any);
}

function useFromObject<T>(store: any, namespace: string | null, props: KnownKeys<T>[], cb: Function) {
	const obj: any = {};
	// 优化写法
	for (let key in props) {
		if (props.hasOwnProperty(key)) {
			obj[key] = runCB(cb, store, namespace, props[key]);
		}
	}
	return obj;
}

export function computedGetter<T = any>(store: any, prop: string) {
	return computed<T>(() => store.getters[prop]);
}

export function getMutation(store: any, mutation: string): Function {
	return function () {
		return store.commit.apply(store, [mutation, ...arguments]);
	}
}

export function getAction(store: any, action: string): Function {
	return function () {
		return store.dispatch.apply(store, [action, ...arguments]);
	}
}

// 这个泛型参数T没看出啥用处
export function useMapping<T>(store: any, namespace: string | null, map: KnownKeys<T>[] | Array<string> | undefined, cb: Function) {
	if (!map) {
		return {};
	}
	if (map instanceof Array) {
		return useFromArray(store, namespace, map as Array<string>, cb);
	}
	return useFromObject(store, namespace, map, cb);
}

export function getStoreFromInstance<T = any>() {
	const vm = getCurrentInstance();
	if (!vm) {
		throw new Error('You must use this function within the "setup()" method, or insert the store as first argument.')
	}
	return (vm.proxy as any)?.$store as Store<T>;
}
