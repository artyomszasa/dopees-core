export interface Equatable<T> {
    equalsTo(other: T): boolean;
}
export interface Comparable<T> {
    compareTo(other: T): (-1 | 0 | 1);
}
export interface EqualityComparer<T> {
    (a: T, b: T): boolean;
}
export interface Comparer<T> {
    (a: T, b: T): (-1 | 0 | 1);
}
export declare function equalityComparer<T extends Equatable<T>>(): EqualityComparer<T>;
export declare function comparer<T extends Comparable<T>>(): Comparer<T>;
export declare function greaterThan<T extends Comparable<T>>(a: T, b: T): boolean;
export declare function lessThan<T extends Comparable<T>>(a: T, b: T): boolean;
export declare function greaterThanOrEqualTo<T extends Comparable<T>>(a: T, b: T): boolean;
export declare function lessThanOrEqualTo<T extends Comparable<T>>(a: T, b: T): boolean;
