
export interface Disposable {
  dispose(): void
}

export function using<T extends Disposable, R>(disposable: T, action: (arg: T) => R) {
  try {
    return action(disposable);
  } finally {
    disposable.dispose();
  }
}

export async function asyncUsing<T extends Disposable, R>(disposable: T, action: (arg: T) => Promise<R>) {
  try {
    return await action(disposable);
  } finally {
    disposable.dispose();
  }
}