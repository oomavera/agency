import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  author: string;
  date: string;
  thumbnail: string;
  heroImage: string;
  category: string;
  content: string;
  readingTime: string;
}

const postsDirectory = path.join(process.cwd(), 'content/blog/posts');

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Check if posts directory exists
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter((name) => name.endsWith('.mdx'))
      .map((name) => {
        const slug = name.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, name);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const readingStats = readingTime(content);

        return {
          slug,
          title: data.title || '',
          subtitle: data.subtitle || '',
          excerpt: data.excerpt || '',
          author: data.author || '',
          date: data.date || '',
          thumbnail: data.thumbnail || '',
          heroImage: data.heroImage || '',
          category: data.category || '',
          content,
          readingTime: readingStats.text,
        } as BlogPost;
      });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const readingStats = readingTime(content);

    return {
      slug,
      title: data.title || '',
      subtitle: data.subtitle || '',
      excerpt: data.excerpt || '',
      author: data.author || '',
      date: data.date || '',
      thumbnail: data.thumbnail || '',
      heroImage: data.heroImage || '',
      category: data.category || '',
      content,
      readingTime: readingStats.text,
    } as BlogPost;
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
      .filter((name) => name.endsWith('.mdx'))
      .map((name) => name.replace(/\.mdx$/, ''));
  } catch (error) {
    console.error('Error reading post slugs:', error);
    return [];
  }
}