import { ExternalLink, Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import config from '@config.json';

import Typography from '~/components/typography';
import Card from '~/components/card';
import { cn } from '~/utils';

export const path = '/contact';
export const element = Contact;

export const showInHeader = true;
export const headerOrder = 4;

function Contact() {
	return (
		<div className='flex justify-center items-center p-0 min-h-[calc(100dvh-5dvh)] overflow-clip'>
			<Helmet>
				<title>Contact » {config.name}</title>
			</Helmet>
			<div className='slide-in-from-bottom-8 flex flex-col items-center gap-4 m-auto w-full md:w-auto animate-in duration-500 zoom-in-105 fade-in-0'>
				<div className='flex flex-col items-center gap-4'>
					<Typography
						tag='h1'
						className='bg-clip-text bg-linear-to-br from-white to-neutral-500 font-semibold text-transparent'
					>
						Contact
					</Typography>
				</div>
				<div className='gap-2 md:gap-6 grid grid-cols-1 md:grid-cols-2 m-4 sm:m-0 p-4 w-full md:w-auto'>
					<ContactCard
						name='Email'
						body={config.links.email.text}
						href={config.links.email.href}
						icon={<Mail size={24} />}
						color='red'
					/>
					<ContactCard
						name='GitHub'
						body={config.links.github.text}
						href={config.links.github.href}
						icon={<Github size={24} />}
						color='blue'
					/>
					<ContactCard
						name='LinkedIn'
						body={config.links.linkedin.text}
						href={config.links.linkedin.href}
						icon={<Linkedin size={24} />}
						color='green'
					/>
					<ContactCard
						name='Twitter / X'
						body={config.links.twitter.text}
						href={config.links.twitter.href}
						icon={<Twitter size={24} />}
						color='purple'
					/>
				</div>
			</div>
		</div>
	);
}

const styles = {
	icon: cva(
		'flex justify-center items-center bg-neutral-500/20 p-1.5 border border-neutral-300/50 rounded-full w-8 h-8 transition-all',
		{
			variants: {
				highlights: {
					red: 'group-hover:border-rose-500/50 group-hover:bg-rose-400/20 group-hover:text-rose-500',
					green: 'group-hover:border-green-500/50 group-hover:bg-green-400/20 group-hover:text-green-500',
					blue: 'group-hover:border-blue-500/50 group-hover:bg-blue-400/20 group-hover:text-blue-500',
					purple: 'group-hover:border-purple-500/50 group-hover:bg-purple-400/20 group-hover:text-purple-500',
					white: 'group-hover:border-neutral-500/50 group-hover:bg-neutral-400/20 group-hover:text-neutral-500',
				},
			},
			defaultVariants: {
				highlights: 'purple',
			},
		},
	),
};

function ContactCard({ name, href, body, icon, color, className }: ContactCardProps) {
	return (
		<Link
			tabIndex={0}
			className='group focus-visible:outline-hidden focus-visible:ring-0'
			to={href}
			target='_blank'
		>
			<Card
				tabIndex={-1}
				className={cn(
					className,
					'min-w-[325px] cursor-pointer group-focus-visible:ring-2 group-focus-visible:ring-white',
				)}
				radius='md'
				highlights={color}
			>
				<div className='flex items-center gap-4'>
					<div className={styles.icon({ highlights: color })}>{icon}</div>
					<div className='flex flex-col justify-center'>
						<Typography tag='h6'>{name}</Typography>
						<Typography tag='p' colour='muted'>
							{body}
						</Typography>
					</div>
					<ExternalLink className='ml-auto' size={18} />
				</div>
			</Card>
		</Link>
	);
}
