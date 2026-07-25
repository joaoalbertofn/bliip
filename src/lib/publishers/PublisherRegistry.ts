import { PublishingAdapter } from './PublishingAdapter';
import { BufferPublisher } from './BufferPublisher';

class PublisherRegistryEngine {
  private adapters: Map<string, PublishingAdapter> = new Map();

  constructor() {
    // Registrar adapters padrão
    this.register(new BufferPublisher());
  }

  public register(adapter: PublishingAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getPublisher(id: string = 'buffer'): PublishingAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAllPublishers(): PublishingAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const PublisherRegistry = new PublisherRegistryEngine();
