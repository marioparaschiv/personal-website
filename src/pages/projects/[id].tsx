import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import { ArrowLeft, LinkIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import config from '@config.json';
import { useEffect } from 'react';

import TechnologiesList from '~/components/technologies';
import Typography from '~/components/typography';
import Button from '~/components/button';
import Media from '~/components/media';
import Card from '~/components/card';
import Tag from '~/components/tag';

export const path = '/projects/:id';
export const element = Project;

export const showInHeader = false;
export const headerOrder = 3;

function Project() {
	const { id } = useParams();
	const navigate = useNavigate();

	const project = config.projects.find((p) => p.id === id);

	useEffect(() => {
		if (!project) {
			navigate('/projects');
		}
	}, []);

	if (!project) {
		return null;
	}

	const successor = project.successor && config.projects.find((p) => p.id === project.successor);

	return (
		<div className='flex min-h-[calc(100dvh-5dvh)] mt-10 justify-center items-center p-0 overflow-clip'>
			<Helmet>
				<title>
					{project.name} » {config.name}
				</title>
			</Helmet>
			<div className='flex flex-col items-center gap-16 m-auto zoom-in-105 w-full animate-in duration-500 fade-in-0 md:container'>
				<div className='flex justify-between items-center px-8 w-full'>
					<Button className='gap-2' size='sm' onClick={() => navigate('/projects')}>
						<ArrowLeft size={12} /> Browse
					</Button>
					<div className='ml-auto flex gap-4'>
						{project.repository && (
							<Link
								className='flex justify-end items-center gap-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
								target='_blank'
								to={project.repository}
							>
								<span className='animate-underline'>Source</span>{' '}
								<ArrowTopRightIcon />
							</Link>
						)}
						{project.url && (
							<Link
								className='flex justify-end items-center gap-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
								target='_blank'
								to={project.url}
							>
								<span className='animate-underline'>Website</span>{' '}
								<ArrowTopRightIcon />
							</Link>
						)}
					</div>
				</div>
				<div className='gap-5 md:gap-9 grid grid-cols-5 px-8 pb-16 w-full md:h-auto'>
					<div className='flex flex-col gap-5 lg:gap-8 col-span-5 md:col-span-2'>
						<div className='flex items-center gap-4'>
							<img
								loading='eager'
								decoding='async'
								className='shadow-none border-none rounded-2xl max-w-none h-24 object-cover outline-none scale-[1.02]'
								src={project.icon.path}
							/>
							<div className='flex md:flex-col justify-between md:justify-start items-start gap-1 w-full md:w-auto'>
								<div className='flex flex-col'>
									<Typography
										tag='h1'
										className='font-bold text-white text-xl lg:text-2xl'
									>
										{project.name}
									</Typography>
									<Typography
										tag='p'
										className='font-medium text-neutral-400 text-sm md:text-base lg:text-lg'
									>
										{project.type}
									</Typography>
								</div>
								<Tag className={project.badge.styles}>{project.badge.text}</Tag>
							</div>
						</div>
						<div className='flex flex-col gap-6 md:gap-5 lg:gap-8'>
							{successor && (
								<div className='flex flex-col gap-1.5 md:gap-3 lg:gap-5'>
									<Typography
										tag='h1'
										className='font-bold text-base text-white md:text-lg lg:text-2xl'
									>
										Successor
									</Typography>
									<Link
										className='group focus-visible:outline-none focus-visible:ring-0'
										to={'/projects/' + successor.id}
									>
										<Card className='group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-white min-w-fit cursor-pointer pointer-events-auto'>
											<div className='flex items-center gap-4'>
												<img
													loading='eager'
													decoding='async'
													className='rounded-lg h-12 object-cover'
													src={successor.icon.path}
												/>
												<div className='flex md:flex-col justify-between md:justify-start items-start gap-1 w-full md:w-auto'>
													<div className='flex flex-col'>
														<Typography
															tag='h1'
															className='font-bold text-sm text-white sm:text-base md:text-lg lg:text-lg'
														>
															{successor.name}
														</Typography>
														<Typography
															tag='p'
															className='font-medium text-neutral-400 text-xs lg:text-sm'
														>
															{successor.type}
														</Typography>
													</div>
												</div>
												<div className='ml-auto'>
													<LinkIcon size={18} />
												</div>
											</div>
										</Card>
									</Link>
								</div>
							)}
							<div className='flex flex-col gap-1.5 md:gap-3 lg:gap-5'>
								<Typography
									tag='h1'
									className='font-bold text-white text-lg lg:text-2xl'
								>
									Overview
								</Typography>
								<Typography
									tag='p'
									className='font-medium text-neutral-400 text-sm lg:text-base truncate whitespace-pre-wrap'
								>
									{project.overview.join('\n') || 'None.'}
								</Typography>
							</div>
							{project.solutions?.length && (
								<div className='flex flex-col gap-1.5 md:gap-3 lg:gap-5'>
									<Typography
										tag='h1'
										className='font-bold text-white text-lg lg:text-2xl'
									>
										Solutions
									</Typography>
									<div className='grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 font-medium text-neutral-400 text-sm lg:text-base truncate whitespace-pre-wrap'>
										{project.solutions.map((solution, index) => (
											<div className='flex gap-2'>
												<Link
													key={solution.url + index}
													to={solution.url}
													className='focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-white text-blue-500 animate-underline'
												>
													{solution.name}
												</Link>
											</div>
										))}
									</div>
								</div>
							)}
							<div className='flex flex-col gap-1.5 md:gap-3 lg:gap-5'>
								<Typography
									tag='h1'
									className='font-bold text-base text-white md:text-lg lg:text-2xl'
								>
									Responsibilities
								</Typography>
								<Typography
									tag='p'
									className='font-medium text-neutral-400 text-sm lg:text-base truncate whitespace-pre-line'
								>
									{project.responsibilities.join('\n') || 'None.'}
								</Typography>
							</div>
							{project.technologies?.length !== 0 && (
								<div className='flex flex-col gap-1.5 md:gap-3 lg:gap-5'>
									<Typography
										tag='h1'
										className='font-bold text-base text-white md:text-lg lg:text-2xl'
									>
										Technologies
									</Typography>
									<Typography
										tag='p'
										className='font-medium text-neutral-400 text-sm lg:text-base'
									>
										<TechnologiesList technologies={project.technologies} />
									</Typography>
								</div>
							)}
						</div>
					</div>
					<div className='flex flex-col gap-3 mt-4 md:mt-0 col-span-5 md:col-span-3 cursor-pointer'>
						<Media images={project.images} footer={{ subtitle: project.name }} />
					</div>
				</div>
			</div>
		</div>
	);
}
