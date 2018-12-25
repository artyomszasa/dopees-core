export interface Equatable<T> {
  equalsTo(other: T): boolean;
}

export interface Comparable<T> {
  compareTo(other: T): (-1|0|1);
}

export interface EqualityComparer<T> {
  (a: T, b: T): boolean;
}

export interface Comparer<T> {
  (a: T, b: T): (-1|0|1);
}

export function equalityComparer<T extends Equatable<T>>(): EqualityComparer<T> {
  return (a: T, b: T) => a === b || !!(a && a.equalsTo(b));
}

export function comparer<T extends Comparable<T>>(): Comparer<T> {
  return (a: T, b: T) => a.compareTo(b);
}

export function greaterThan<T extends Comparable<T>>(a: T, b: T): boolean {
  return a.compareTo(b) > 0;
}

export function lessThan<T extends Comparable<T>>(a: T, b: T): boolean {
  return a.compareTo(b) < 0;
}

export function greaterThanOrEqualTo<T extends Comparable<T>>(a: T, b: T): boolean {
  return a.compareTo(b) >= 0;
}

export function lessThanOrEqualTo<T extends Comparable<T>>(a: T, b: T): boolean {
  return a.compareTo(b) <= 0;
}